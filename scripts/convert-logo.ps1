Add-Type -AssemblyName System.Drawing
$src = "C:\Users\Admin\.gemini\antigravity\brain\b25d931a-b081-481b-bbd7-e269e8bb5475\.user_uploaded\media_1794986690898_475a608f.jpg"
if (Test-Path $src) {
    $img = [System.Drawing.Image]::FromFile($src)
    Write-Host "Width: $($img.Width), Height: $($img.Height)"
    $img.Save("public\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Save("public\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Save("public\ung-logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Save("src\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Dispose()
    Write-Host "Done converting logo!"
} else {
    Write-Error "Source not found"
}
