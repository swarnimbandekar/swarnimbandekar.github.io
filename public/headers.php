
<?php
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');

echo "VINTED WEBVIEW HEADER TEST\n";
echo "=========================\n\n";

$headers = function_exists('getallheaders')
    ? getallheaders()
    : [];

foreach ($headers as $name => $value) {
    if (preg_match('/authorization|cookie|token|secret|session|api.key/i', $name)) {
        $value = '[PRESENT - VALUE REDACTED]';
    }

    echo $name . ': ' . $value . "\n";
}
