-- ============================================
-- UPDATE ROW LEVEL SECURITY POLICIES
-- Run this in Supabase SQL Editor to fix cross-device sync
-- ============================================

-- First, drop all existing policies
DROP POLICY IF EXISTS "Allow all operations for all users on travel_entries" ON travel_entries;
DROP POLICY IF EXISTS "Allow all operations for all users on country_rules" ON country_rules;
DROP POLICY IF EXISTS "Users can access own travel entries" ON travel_entries;
DROP POLICY IF EXISTS "Users can access own country rules" ON country_rules;
DROP POLICY IF EXISTS "Allow deviceId access to travel entries" ON travel_entries;
DROP POLICY IF EXISTS "Allow deviceId access to country rules" ON country_rules;

-- Create new policies for authenticated users
-- These allow users to only see/modify their own data
CREATE POLICY "Users can access own travel entries"
  ON travel_entries
  FOR ALL
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can access own country rules"
  ON country_rules
  FOR ALL
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Optional: Allow legacy deviceId-based access (for backwards compatibility)
-- Uncomment these if you still have data using device_* user_ids
/*
CREATE POLICY "Allow deviceId access to travel entries"
  ON travel_entries
  FOR ALL
  USING (user_id LIKE 'device_%')
  WITH CHECK (user_id LIKE 'device_%');

CREATE POLICY "Allow deviceId access to country rules"
  ON country_rules
  FOR ALL
  USING (user_id LIKE 'device_%')
  WITH CHECK (user_id LIKE 'device_%');
*/

-- Verify RLS is enabled
ALTER TABLE travel_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_rules ENABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS policies updated successfully!' as message;
