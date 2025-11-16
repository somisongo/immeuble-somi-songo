import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const createUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  firstName: z.string().trim().min(1).max(50).regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Invalid name format'),
  lastName: z.string().trim().min(1).max(50).regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Invalid name format'),
  role: z.enum(['owner', 'tenant']),
  tenantId: z.string().uuid().optional(),
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client for checking caller authorization
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('[CREATE-USER] Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller has owner role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'owner') {
      console.warn('[CREATE-USER] Unauthorized access attempt by user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Only owners can create user accounts' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      console.warn('[CREATE-USER] Validation failed:', validation.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          details: validation.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, password, firstName, lastName, role, tenantId } = validation.data;

    // Create user with service role
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        email: email
      }
    });

    if (signUpError) {
      console.error('[CREATE-USER] User creation failed:', signUpError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!signUpData.user) {
      console.error('[CREATE-USER] No user returned from creation');
      return new Response(
        JSON.stringify({ error: 'User creation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assign role using service client
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: signUpData.user.id,
        role: role,
      });

    if (roleInsertError) {
      console.error('[CREATE-USER] Role assignment failed:', roleInsertError);
      // Cleanup: delete the user since role assignment failed
      await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id);
      return new Response(
        JSON.stringify({ error: 'Failed to assign user role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If tenant role and tenant ID provided, link them
    if (role === 'tenant' && tenantId) {
      const { error: linkError } = await supabaseAdmin
        .from('tenants')
        .update({ user_id: signUpData.user.id })
        .eq('id', tenantId);

      if (linkError) {
        console.error('[CREATE-USER] Tenant linking failed:', linkError);
        // Don't fail the request, just log it
      }
    }

    // Audit log
    console.log('[CREATE-USER] User created successfully:', {
      createdBy: user.id,
      newUserId: signUpData.user.id,
      email: email,
      role: role,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        userId: signUpData.user.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[CREATE-USER] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
