<?php
// backend/api/social_media_poster.php
// Helper class to post products to Facebook and Instagram automatically.

class SocialMediaPoster {

    // Post to Facebook
    public static function postToFacebook($message, $link = null, $image_url = null) {
        $page_id = getenv('FACEBOOK_PAGE_ID') ?: 'YOUR_PAGE_ID_HERE';
        $access_token = getenv('META_ACCESS_TOKEN') ?: 'YOUR_ACCESS_TOKEN_HERE';

        if(empty($page_id) || empty($access_token) || $page_id === 'YOUR_PAGE_ID_HERE') {
            return ["error" => "Facebook credentials not configured in .env"];
        }

        $url = "https://graph.facebook.com/v19.0/{$page_id}/photos";
        
        $params = [
            'access_token' => $access_token,
        ];

        if ($image_url) {
            $params['url'] = $image_url;
            $params['message'] = $message . ($link ? "\n\nBuy it here: " . $link : "");
            // Facebook API endpoint for posting a photo
            $url = "https://graph.facebook.com/v19.0/{$page_id}/photos";
        } else {
            $params['message'] = $message;
            if ($link) {
                $params['link'] = $link;
            }
            // Facebook API endpoint for posting a status/link
            $url = "https://graph.facebook.com/v19.0/{$page_id}/feed";
        }

        return self::curlRequest($url, $params);
    }

    // Post to Instagram
    public static function postToInstagram($image_url, $caption) {
        $ig_user_id = getenv('INSTAGRAM_ACCOUNT_ID') ?: 'YOUR_IG_ACCOUNT_ID_HERE';
        $access_token = getenv('META_ACCESS_TOKEN') ?: 'YOUR_ACCESS_TOKEN_HERE';

        if(empty($ig_user_id) || empty($access_token) || $ig_user_id === 'YOUR_IG_ACCOUNT_ID_HERE') {
            return ["error" => "Instagram credentials not configured in .env"];
        }

        // 1. Create a media container
        $container_url = "https://graph.facebook.com/v19.0/{$ig_user_id}/media";
        $container_params = [
            'image_url' => $image_url,
            'caption'   => $caption,
            'access_token' => $access_token
        ];

        $container_response = self::curlRequest($container_url, $container_params);
        $container_response_obj = json_decode($container_response, true);

        if (isset($container_response_obj['id'])) {
            $creation_id = $container_response_obj['id'];
            
            // 2. Publish the container
            $publish_url = "https://graph.facebook.com/v19.0/{$ig_user_id}/media_publish";
            $publish_params = [
                'creation_id' => $creation_id,
                'access_token' => $access_token
            ];
            
            return self::curlRequest($publish_url, $publish_params);
        } else {
            return $container_response;
        }
    }

    private static function curlRequest($url, $params) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        return $response;
    }
}
?>
