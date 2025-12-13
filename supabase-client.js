// Supabase client initialization
// This file creates a global supabase client that can be used throughout the app

let supabaseClient = null;

// Wait for environment variables to load
async function waitForEnv() {
  while (!window.envLoaded) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

// Initialize Supabase client after environment variables are loaded
async function initSupabase() {
  await waitForEnv();
  
  if (!window.ENV.SUPABASE_URL || !window.ENV.SUPABASE_ANON_KEY) {
    console.error('Supabase credentials not found in environment variables');
    return null;
  }

  if (window.ENV.SUPABASE_URL === 'your_supabase_project_url' || 
      window.ENV.SUPABASE_ANON_KEY === 'your_supabase_anon_key') {
    console.warn('Please update .env.local with your actual Supabase credentials');
    return null;
  }

  try {
    const { createClient } = supabase;
    supabaseClient = createClient(
      window.ENV.SUPABASE_URL,
      window.ENV.SUPABASE_ANON_KEY
    );
    console.log('Supabase client initialized successfully');
    return supabaseClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

// Export function to get Supabase client
window.getSupabaseClient = async function() {
  if (!supabaseClient) {
    supabaseClient = await initSupabase();
  }
  return supabaseClient;
};

// Fetch events from Supabase
window.fetchSupabaseEvents = async function(fetchInfo, successCallback, failureCallback) {
  try {
    const client = await window.getSupabaseClient();
    
    if (!client) {
      console.warn('Supabase client not available, falling back to events.json');
      const res = await fetch('events.json');
      const data = await res.json();
      if (successCallback) {
        successCallback(data);
      }
      return data;
    }

    console.log('Fetching events from Supabase...');
    const { data, error } = await client
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log('Raw Supabase data:', data);

    // Transform Supabase events to FullCalendar format
    const transformedEvents = data.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start_time,
      end: event.end_time,
      allDay: event.all_day || false,
      color: event.color || '#3788d8',
      extendedProps: {
        description: event.description,
        location: event.location,
        isRecurring: event.is_recurring,
        seriesId: event.series_id,
        recurrenceRule: event.recurrence_rule,
        recurrenceEndDate: event.recurrence_end_date,
        createdBy: event.created_by
      }
    }));

    console.log('Transformed events for FullCalendar:', transformedEvents);
    
    if (successCallback) {
      successCallback(transformedEvents);
    }
    return transformedEvents;
  } catch (error) {
    console.error('Failed to fetch events from Supabase:', error);
    if (failureCallback) {
      failureCallback(error);
    }
    // Fallback to local events.json
    console.warn('Falling back to events.json');
    try {
      const res = await fetch('events.json');
      const data = await res.json();
      if (successCallback) {
        successCallback(data);
      }
      return data;
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      if (failureCallback) {
        failureCallback(fallbackError);
      }
      return [];
    }
  }
};

// Save event to Supabase (create or update)
window.saveEventToSupabase = async function(eventData) {
  try {
    const client = await window.getSupabaseClient();
    
    if (!client) {
      console.error('Supabase client not available');
      throw new Error('Database connection not available');
    }

    // Get current user
    const user = await window.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Prepare data for Supabase
    const dbEvent = {
      title: eventData.title,
      description: eventData.description || null,
      start_time: eventData.start,
      end_time: eventData.end,
      all_day: eventData.allDay || false,
      color: eventData.color || '#3788d8',
      location: eventData.location || null,
      is_recurring: false,
      series_id: null,
      recurrence_rule: null,
      recurrence_end_date: null,
      created_by: user.id
    };

    let result;
    if (eventData.id) {
      // Update existing event
      const { data, error } = await client
        .from('events')
        .update(dbEvent)
        .eq('id', eventData.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
      console.log('Event updated:', result);
    } else {
      // Create new event
      const { data, error } = await client
        .from('events')
        .insert([dbEvent])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
      console.log('Event created:', result);
    }

    return result;
  } catch (error) {
    console.error('Failed to save event:', error);
    throw error;
  }
};

// Delete event from Supabase
window.deleteEventFromSupabase = async function(eventId) {
  try {
    const client = await window.getSupabaseClient();
    
    if (!client) {
      console.error('Supabase client not available');
      throw new Error('Database connection not available');
    }

    const { error } = await client
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    
    console.log('Event deleted:', eventId);
    return true;
  } catch (error) {
    console.error('Failed to delete event:', error);
    throw error;
  }
};

// Fetch todos from Supabase
window.fetchSupabaseTodos = async function() {
  try {
    const client = await window.getSupabaseClient();
    
    if (!client) {
      console.warn('Supabase client not available, falling back to todos.json');
      const res = await fetch('todos.json');
      return await res.json();
    }

    // Get current user
    const user = await window.getCurrentUser();
    if (!user) {
      console.warn('No authenticated user, returning empty todos');
      return [];
    }

    console.log('Fetching todos from Supabase for user:', user.id);
    const { data, error } = await client
      .from('todos')
      .select('*')
      .eq('created_by', user.id)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log('Raw Supabase todos:', data);

    // Transform Supabase todos to UI format
    const transformedTodos = data.map(todo => ({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      dueDate: todo.due_date,
      completed: todo.completed || false,
      priority: todo.priority || 1,
      category: todo.category,
      color: getCategoryColor(todo.category),
      duration: 30 // default duration for draggable events
    }));

    console.log('Transformed todos for UI:', transformedTodos);
    return transformedTodos;
  } catch (error) {
    console.error('Failed to fetch todos from Supabase:', error);
    // Fallback to local todos.json
    console.warn('Falling back to todos.json');
    try {
      const res = await fetch('todos.json');
      return await res.json();
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return [];
    }
  }
};

// Helper function to get color based on category
function getCategoryColor(category) {
  const colorMap = {
    'MEETING': '#ef4444',
    'PRESENTATION': '#f59e0b',
    'WORK': '#3b82f6',
    'ADMIN': '#10b981',
    'REVIEW': '#8b5cf6',
    'PERSONAL': '#ec4899',
    'URGENT': '#dc2626',
    'LOW': '#64748b'
  };
  return colorMap[category?.toUpperCase()] || '#3b82f6';
}

// Save todo to Supabase (create or update)
window.saveTodoToSupabase = async function(todoData) {
  try {
    const client = await window.getSupabaseClient();
    
    if (!client) {
      console.error('Supabase client not available');
      throw new Error('Database connection not available');
    }

    // Get current user
    const user = await window.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Prepare data for Supabase
    const dbTodo = {
      title: todoData.title,
      description: todoData.description || null,
      due_date: todoData.dueDate,
      completed: todoData.completed || false,
      priority: todoData.priority || 1,
      category: todoData.category || 'TASK',
      duration: todoData.duration || 30,
      color: todoData.color || '#3b82f6',
      created_by: user.id
    };

    let result;
    if (todoData.id) {
      // Update existing todo
      const { data, error } = await client
        .from('todos')
        .update(dbTodo)
        .eq('id', todoData.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
      console.log('Todo updated:', result);
    } else {
      // Create new todo
      const { data, error } = await client
        .from('todos')
        .insert([dbTodo])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
      console.log('Todo created:', result);
    }

    return result;
  } catch (error) {
    console.error('Failed to save todo:', error);
    throw error;
  }
};

// Delete todo from Supabase
window.deleteTodoFromSupabase = async function(todoId) {
  try {
    const client = await window.getSupabaseClient();
    
    if (!client) {
      console.error('Supabase client not available');
      throw new Error('Database connection not available');
    }

    const { error } = await client
      .from('todos')
      .delete()
      .eq('id', todoId);

    if (error) throw error;
    
    console.log('Todo deleted:', todoId);
    return true;
  } catch (error) {
    console.error('Failed to delete todo:', error);
    throw error;
  }
};

// Toggle todo completion status
window.toggleTodoCompletion = async function(todoId, completed) {
  try {
    const client = await window.getSupabaseClient();
    
    if (!client) {
      console.error('Supabase client not available');
      throw new Error('Database connection not available');
    }

    const { data, error } = await client
      .from('todos')
      .update({ completed: completed })
      .eq('id', todoId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('Todo completion toggled:', data);
    return data;
  } catch (error) {
    console.error('Failed to toggle todo completion:', error);
    throw error;
  }
};

// ==================== AUTHENTICATION FUNCTIONS ====================

// Get current session
window.getSession = async function() {
  try {
    const client = await window.getSupabaseClient();
    if (!client) return null;

    const { data: { session }, error } = await client.auth.getSession();
    
    if (error) {
      console.error('Failed to get session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Get current user
window.getCurrentUser = async function() {
  try {
    const client = await window.getSupabaseClient();
    if (!client) return null;

    const { data: { user }, error } = await client.auth.getUser();
    
    if (error) {
      console.error('Failed to get user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Get user profile (extended user data)
window.getUserProfile = async function() {
  try {
    const client = await window.getSupabaseClient();
    if (!client) return null;

    const user = await window.getCurrentUser();
    if (!user) return null;

    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Sign up new user
window.signUp = async function(formData) {
  try {
    const client = await window.getSupabaseClient();
    
    if (!client) {
      return { success: false, error: 'Database connection not available' };
    }

    // Create auth user with all metadata
    const { data: authData, error: authError } = await client.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          university: formData.university,
          major: formData.major,
          year_level: formData.year_level,
          semester: formData.semester
        },
        emailRedirectTo: window.location.origin + '/login.html'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    console.log('User created:', authData.user.id);

    // Wait a moment for the session to be established
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try to create user profile with academic info
    try {
      const { data: profileData, error: profileError } = await client
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          university: formData.university,
          major: formData.major,
          year_level: formData.year_level,
          semester: parseInt(formData.semester)
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // If profile creation fails due to RLS, try with anon access
        // The user account was still created successfully
        console.warn('Profile creation failed, but user account exists. User can complete profile later.');
        
        // Return success anyway - user can log in
        return { 
          success: true, 
          user: authData.user,
          profileCreated: false,
          warning: 'Account created successfully. Please complete your profile after logging in.'
        };
      }

      console.log('Profile created successfully:', profileData);
      return { success: true, user: authData.user, profileCreated: true };

    } catch (profileErr) {
      console.error('Profile creation exception:', profileErr);
      // User account still exists, just profile creation failed
      return { 
        success: true, 
        user: authData.user,
        profileCreated: false,
        warning: 'Account created successfully. Please complete your profile after logging in.'
      };
    }

  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};

// Sign in existing user
window.signIn = async function(email, password) {
  try {
    const client = await window.getSupabaseClient();
    
    if (!client) {
      return { success: false, error: 'Database connection not available' };
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }

    console.log('User signed in successfully:', data.user.id);
    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
};

// Sign out
window.signOut = async function() {
  try {
    const client = await window.getSupabaseClient();
    
    if (!client) {
      return { success: false, error: 'Database connection not available' };
    }

    const { error } = await client.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }

    console.log('User signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// Reset password
window.resetPassword = async function(email) {
  try {
    const client = await window.getSupabaseClient();
    
    if (!client) {
      return { success: false, error: 'Database connection not available' };
    }

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html'
    });

    if (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }

    console.log('Password reset email sent');
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: error.message };
  }
};

// Check if user is authenticated (for route protection)
window.requireAuth = async function() {
  const session = await window.getSession();
  
  if (!session) {
    // Redirect to login page
    window.location.href = 'login.html';
    return false;
  }

  return true;
};
