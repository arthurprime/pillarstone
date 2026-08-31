/*
# Add WhatsApp inquiry columns to inquiries table

1. Modified Tables
- `inquiries`
  - `user_id` (uuid, nullable) — references auth.users, links inquiry to logged-in user
  - `channel` (text, default 'form') — how the inquiry was initiated ('form' or 'whatsapp')
  - `generated_message` (text, nullable) — the pre-filled WhatsApp message text
  - `property_reference` (text, nullable) — the property reference number at time of inquiry

2. Security
- No RLS policy changes needed — existing `inquiries_insert_public` policy already allows
  anon + authenticated inserts with `WITH CHECK (true)`, which is correct for a public contact form.
- The new columns are all nullable so existing rows are unaffected.

3. Notes
- `user_id` is nullable because visitors may not be logged in when they click the WhatsApp button.
- `channel` defaults to 'form' so existing inquiries (created via the contact form) are unaffected.
- `property_reference` captures the reference at inquiry time in case the property is later deleted.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inquiries' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.inquiries ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inquiries' AND column_name = 'channel'
  ) THEN
    ALTER TABLE public.inquiries ADD COLUMN channel text NOT NULL DEFAULT 'form' CHECK (channel IN ('form', 'whatsapp'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inquiries' AND column_name = 'generated_message'
  ) THEN
    ALTER TABLE public.inquiries ADD COLUMN generated_message text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inquiries' AND column_name = 'property_reference'
  ) THEN
    ALTER TABLE public.inquiries ADD COLUMN property_reference text;
  END IF;
END $$;
