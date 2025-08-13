<?php
/**
 * Plugin Name: Supabase User Sync
 * Description: Synchronizes WordPress users with Supabase backend
 * Version: 1.0.0
 * Author: Your Company
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class SupabaseUserSync {
    
    private $supabase_url;
    private $supabase_function_url;
    
    public function __construct() {
        add_action('init', [$this, 'init']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('user_register', [$this, 'sync_new_user_to_supabase']);
        add_action('profile_update', [$this, 'sync_updated_user_to_supabase']);
        add_action('wp_ajax_test_supabase_connection', [$this, 'test_supabase_connection']);
        add_action('wp_ajax_sync_all_users', [$this, 'sync_all_users_to_supabase']);
    }
    
    public function init() {
        $this->supabase_url = get_option('supabase_url', '');
        $this->supabase_function_url = $this->supabase_url ? rtrim($this->supabase_url, '/') . '/functions/v1/wordpress-sync' : '';
    }
    
    public function add_admin_menu() {
        add_options_page(
            'Supabase User Sync',
            'Supabase Sync',
            'manage_options',
            'supabase-user-sync',
            [$this, 'admin_page']
        );
    }
    
    public function admin_page() {
        // Handle form submission
        if (isset($_POST['submit'])) {
            update_option('supabase_url', sanitize_text_field($_POST['supabase_url']));
            update_option('supabase_anon_key', sanitize_text_field($_POST['supabase_anon_key']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        $supabase_url = get_option('supabase_url', '');
        $supabase_anon_key = get_option('supabase_anon_key', '');
        ?>
        <div class="wrap">
            <h1>Supabase User Sync Settings</h1>
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">Supabase URL</th>
                        <td>
                            <input type="url" name="supabase_url" value="<?php echo esc_attr($supabase_url); ?>" class="regular-text" />
                            <p class="description">Your Supabase project URL (e.g., https://yourproject.supabase.co)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Supabase Anon Key</th>
                        <td>
                            <input type="text" name="supabase_anon_key" value="<?php echo esc_attr($supabase_anon_key); ?>" class="regular-text" />
                            <p class="description">Your Supabase anonymous/public key</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            
            <h2>Actions</h2>
            <p>
                <button type="button" id="test-connection" class="button">Test Connection</button>
                <button type="button" id="sync-all-users" class="button button-primary">Sync All Users</button>
            </p>
            <div id="sync-results"></div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            $('#test-connection').click(function() {
                $.post(ajaxurl, {
                    action: 'test_supabase_connection'
                }, function(response) {
                    if (response.success) {
                        $('#sync-results').html('<div class="notice notice-success"><p>Connection successful!</p></div>');
                    } else {
                        $('#sync-results').html('<div class="notice notice-error"><p>Connection failed: ' + response.data + '</p></div>');
                    }
                });
            });
            
            $('#sync-all-users').click(function() {
                $(this).prop('disabled', true).text('Syncing...');
                $.post(ajaxurl, {
                    action: 'sync_all_users'
                }, function(response) {
                    if (response.success) {
                        $('#sync-results').html('<div class="notice notice-success"><p>All users synced successfully!</p></div>');
                    } else {
                        $('#sync-results').html('<div class="notice notice-error"><p>Sync failed: ' + response.data + '</p></div>');
                    }
                    $('#sync-all-users').prop('disabled', false).text('Sync All Users');
                });
            });
        });
        </script>
        <?php
    }
    
    public function sync_new_user_to_supabase($user_id) {
        $this->sync_user_to_supabase($user_id);
    }
    
    public function sync_updated_user_to_supabase($user_id) {
        $this->sync_user_to_supabase($user_id);
    }
    
    private function sync_user_to_supabase($user_id) {
        if (!$this->supabase_function_url) {
            return;
        }
        
        $user = get_userdata($user_id);
        if (!$user) {
            return;
        }
        
        $user_data = [
            'id' => $user->ID,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'display_name' => $user->display_name,
            'user_registered' => $user->user_registered,
            'roles' => $user->roles
        ];
        
        $response = wp_remote_post($this->supabase_function_url, [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . get_option('supabase_anon_key', '')
            ],
            'body' => json_encode([
                'action' => 'sync_wordpress_user_to_supabase',
                'data' => $user_data
            ]),
            'timeout' => 30
        ]);
        
        if (is_wp_error($response)) {
            error_log('Supabase sync error: ' . $response->get_error_message());
        }
    }
    
    public function test_supabase_connection() {
        if (!$this->supabase_function_url) {
            wp_send_json_error('Supabase URL not configured');
        }
        
        $response = wp_remote_get($this->supabase_function_url, [
            'headers' => [
                'Authorization' => 'Bearer ' . get_option('supabase_anon_key', '')
            ],
            'timeout' => 10
        ]);
        
        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code === 200) {
            wp_send_json_success('Connection successful');
        } else {
            wp_send_json_error('HTTP ' . $code . ': ' . wp_remote_retrieve_body($response));
        }
    }
    
    public function sync_all_users_to_supabase() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $users = get_users(['number' => -1]);
        $synced = 0;
        $errors = 0;
        
        foreach ($users as $user) {
            $result = $this->sync_user_to_supabase($user->ID);
            if ($result) {
                $synced++;
            } else {
                $errors++;
            }
        }
        
        wp_send_json_success("Synced $synced users, $errors errors");
    }
}

// Initialize the plugin
new SupabaseUserSync();

// Create webhook endpoint for receiving data from Supabase
add_action('rest_api_init', function() {
    register_rest_route('supabase/v1', '/sync-user', [
        'methods' => 'POST',
        'callback' => function($request) {
            $data = $request->get_json_params();
            
            if (!isset($data['email']) || !isset($data['action'])) {
                return new WP_Error('missing_data', 'Email and action are required', ['status' => 400]);
            }
            
            switch ($data['action']) {
                case 'create_user':
                    return create_wordpress_user_from_supabase($data);
                case 'update_user':
                    return update_wordpress_user_from_supabase($data);
                default:
                    return new WP_Error('invalid_action', 'Invalid action', ['status' => 400]);
            }
        },
        'permission_callback' => function($request) {
            // Verify the request is from your Supabase instance
            $auth_header = $request->get_header('authorization');
            $expected_key = get_option('supabase_anon_key', '');
            return $auth_header === 'Bearer ' . $expected_key;
        }
    ]);
});

function create_wordpress_user_from_supabase($data) {
    // Check if user already exists
    $existing_user = get_user_by('email', $data['email']);
    if ($existing_user) {
        return new WP_Error('user_exists', 'User already exists', ['status' => 409]);
    }
    
    $user_id = wp_create_user(
        $data['username'] ?? sanitize_user($data['email']),
        wp_generate_password(),
        $data['email']
    );
    
    if (is_wp_error($user_id)) {
        return $user_id;
    }
    
    // Update user meta
    if (isset($data['display_name'])) {
        wp_update_user([
            'ID' => $user_id,
            'display_name' => $data['display_name']
        ]);
    }
    
    return ['success' => true, 'user_id' => $user_id];
}

function update_wordpress_user_from_supabase($data) {
    $user = get_user_by('email', $data['email']);
    if (!$user) {
        return new WP_Error('user_not_found', 'User not found', ['status' => 404]);
    }
    
    $update_data = ['ID' => $user->ID];
    
    if (isset($data['display_name'])) {
        $update_data['display_name'] = $data['display_name'];
    }
    
    $result = wp_update_user($update_data);
    
    if (is_wp_error($result)) {
        return $result;
    }
    
    return ['success' => true, 'user_id' => $user->ID];
}
?>