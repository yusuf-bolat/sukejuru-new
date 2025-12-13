-- ============================================
-- UPDATED RLS POLICIES FOR USER AUTHENTICATION
-- ============================================
-- These policies ensure users can only access their own data

-- First, drop the old public access policies
DROP POLICY IF EXISTS "Allow public read access to events" ON public.events;
DROP POLICY IF EXISTS "Allow public insert access to events" ON public.events;
DROP POLICY IF EXISTS "Allow public update access to events" ON public.events;
DROP POLICY IF EXISTS "Allow public delete access to events" ON public.events;

DROP POLICY IF EXISTS "Allow public read access to todos" ON public.todos;
DROP POLICY IF EXISTS "Allow public insert access to todos" ON public.todos;
DROP POLICY IF EXISTS "Allow public update access to todos" ON public.todos;
DROP POLICY IF EXISTS "Allow public delete access to todos" ON public.todos;

-- ============================================
-- EVENTS TABLE - AUTHENTICATED USER POLICIES
-- ============================================

-- Users can only read their own events
CREATE POLICY "Users can view own events"
ON public.events
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Users can only create events for themselves
CREATE POLICY "Users can create own events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can only update their own events
CREATE POLICY "Users can update own events"
ON public.events
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Users can only delete their own events
CREATE POLICY "Users can delete own events"
ON public.events
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- ============================================
-- TODOS TABLE - AUTHENTICATED USER POLICIES
-- ============================================

-- Users can only read their own todos
CREATE POLICY "Users can view own todos"
ON public.todos
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Users can only create todos for themselves
CREATE POLICY "Users can create own todos"
ON public.todos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can only update their own todos
CREATE POLICY "Users can update own todos"
ON public.todos
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Users can only delete their own todos
CREATE POLICY "Users can delete own todos"
ON public.todos
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- After applying these policies:
-- 1. Users MUST be authenticated to access any data
-- 2. Each user can ONLY see/modify their own events and todos
-- 3. The created_by field MUST contain the user's auth.uid()
-- 4. Anonymous access is completely blocked
TO anon
USING (true);

-- For authenticated users only (alternative):
-- CREATE POLICY "Users can manage their own todos"
-- ON public.todos
-- FOR ALL
-- TO authenticated
-- USING (auth.uid() = created_by)
-- WITH CHECK (auth.uid() = created_by);
