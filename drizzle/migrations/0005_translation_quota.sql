CREATE TABLE public.translation_device_usage (
  device_hash text NOT NULL,
  hour_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (device_hash, hour_start)
);
GRANT ALL ON public.translation_device_usage TO service_role;
ALTER TABLE public.translation_device_usage ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.translation_daily_usage (
  day date PRIMARY KEY,
  count integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.translation_daily_usage TO service_role;
ALTER TABLE public.translation_daily_usage ENABLE ROW LEVEL SECURITY;

-- Counts only; never any text. Returns 'ok', 'device_limit' or 'daily_limit'.
CREATE OR REPLACE FUNCTION public.consume_translation_quota(_device_hash text, _hourly int, _daily int)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h timestamptz := date_trunc('hour', now()); d date := (now() AT TIME ZONE 'Europe/Zurich')::date; c int;
BEGIN
  SELECT count INTO c FROM translation_daily_usage WHERE day = d FOR UPDATE;
  IF coalesce(c,0) >= _daily THEN RETURN 'daily_limit'; END IF;
  SELECT count INTO c FROM translation_device_usage WHERE device_hash = _device_hash AND hour_start = h FOR UPDATE;
  IF coalesce(c,0) >= _hourly THEN RETURN 'device_limit'; END IF;
  INSERT INTO translation_device_usage VALUES (_device_hash, h, 1)
    ON CONFLICT (device_hash, hour_start) DO UPDATE SET count = translation_device_usage.count + 1;
  INSERT INTO translation_daily_usage VALUES (d, 1)
    ON CONFLICT (day) DO UPDATE SET count = translation_daily_usage.count + 1;
  DELETE FROM translation_device_usage WHERE hour_start < now() - interval '2 hours';
  RETURN 'ok';
END $$;
REVOKE ALL ON FUNCTION public.consume_translation_quota(text,int,int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_translation_quota(text,int,int) TO service_role;