# Download missing product images from Tork VTEX CDN
$outputDir = "assets\productos"

$imagenes = @{
    "200855" = "https://torkco.vteximg.com.br/arquivos/ids/155725/200855_01.jpg"
    "200884" = "https://torkco.vteximg.com.br/arquivos/ids/155724/200884_01.jpg"
    "83161"  = "https://torkco.vteximg.com.br/arquivos/ids/155692/83161_01.jpg"
    "83015"  = "https://torkco.vteximg.com.br/arquivos/ids/155790/83015_01.jpg"
    "201229" = "https://torkco.vteximg.com.br/arquivos/ids/155765/201229_01.jpg"
    "83532"  = "https://torkco.vteximg.com.br/arquivos/ids/155766/83532_01.jpg"
    "201275" = "https://torkco.vteximg.com.br/arquivos/ids/155769/201275_01.jpg"
    "80109"  = "https://torkco.vteximg.com.br/arquivos/ids/155776/80109_01.jpg"
    "200894" = "https://torkco.vteximg.com.br/arquivos/ids/155751/200894_01.jpg"
    "200895" = "https://torkco.vteximg.com.br/arquivos/ids/155752/200895_01.jpg"
    "203232" = "https://torkco.vteximg.com.br/arquivos/ids/156066/203232-Dispensador-de-Papel-Higienico-Jumbo.png"
    # Dispensadores servilleta: use generic page image (80136 is the product on tork.com.co)
    "80131"  = "https://torkco.vteximg.com.br/arquivos/ids/155744/80136_01.jpg"
    "80132"  = "https://torkco.vteximg.com.br/arquivos/ids/155744/80136_01.jpg"
    "80133"  = "https://torkco.vteximg.com.br/arquivos/ids/155744/80136_01.jpg"
    "80134"  = "https://torkco.vteximg.com.br/arquivos/ids/155744/80136_01.jpg"
}

$total = $imagenes.Count
$i = 0

foreach ($entry in $imagenes.GetEnumerator()) {
    $i++
    $codigo = $entry.Key
    $url = $entry.Value
    $extension = if ($url -match '\.png') { "png" } else { "jpg" }
    $filename = "$outputDir\$codigo.$extension"

    if (Test-Path $filename) {
        Write-Host "[$i/$total] SKIP $codigo (already exists)" -ForegroundColor Yellow
        continue
    }

    try {
        Write-Host "[$i/$total] Downloading $codigo..." -NoNewline
        Invoke-WebRequest -Uri $url -OutFile $filename -UseBasicParsing -ErrorAction Stop
        Write-Host " OK" -ForegroundColor Green
    }
    catch {
        Write-Host " ERROR: $_" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 300
}

Write-Host "`nDone. $total images processed." -ForegroundColor Cyan
