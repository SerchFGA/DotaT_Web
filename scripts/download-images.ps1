# Script para descargar imágenes de productos Tork desde VTEX
# Ejecutar desde la raíz del proyecto

$outputDir = "assets\productos"
if (!(Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force }

# Mapa de código de producto -> URL de imagen VTEX
$imagenes = @{
    "71198"  = "https://torkco.vteximg.com.br/arquivos/ids/155701/71198_01.jpg"
    "200868" = "https://torkco.vteximg.com.br/arquivos/ids/155702/200868_01.jpg"
    "71187"  = "https://torkco.vteximg.com.br/arquivos/ids/155703/71187_01.jpg"
    "71457"  = "https://torkco.vteximg.com.br/arquivos/ids/155706/71457_01.jpg"
    "71613"  = "https://torkco.vteximg.com.br/arquivos/ids/155708/71613_01.jpg"
    "71612"  = "https://torkco.vteximg.com.br/arquivos/ids/155709/71612_01.jpg"
    "71357"  = "https://torkco.vteximg.com.br/arquivos/ids/155713/71357_01.jpg"
    "202581" = "https://torkco.vteximg.com.br/arquivos/ids/155888/202581.jpg"
    "202580" = "https://torkco.vteximg.com.br/arquivos/ids/155890/202580.jpg"
    "71107"  = "https://torkco.vteximg.com.br/arquivos/ids/155704/71107_01.jpg"
    "80506"  = "https://torkco.vteximg.com.br/arquivos/ids/155861/80506_01.png"
    "80550"  = "https://torkco.vteximg.com.br/arquivos/ids/155912/80550.png"
    "80536"  = "https://torkco.vteximg.com.br/arquivos/ids/156113/80530.jpg"
    "74312"  = "https://torkco.vteximg.com.br/arquivos/ids/155935/74312.jpg"
    "203390" = "https://torkco.vteximg.com.br/arquivos/ids/155933/203390.jpg"
    "203800" = "https://torkco.vteximg.com.br/arquivos/ids/155924/203800-1.png"
    "73686"  = "https://torkco.vteximg.com.br/arquivos/ids/155675/73686_01.jpg"
    "73689"  = "https://torkco.vteximg.com.br/arquivos/ids/155675/73686_01.jpg"
    "73748"  = "https://torkco.vteximg.com.br/arquivos/ids/155675/73686_01.jpg"
    "73575"  = "https://torkco.vteximg.com.br/arquivos/ids/155675/73686_01.jpg"
    "72611"  = "https://torkco.vteximg.com.br/arquivos/ids/156101/72611.jpg"
    "72609"  = "https://torkco.vteximg.com.br/arquivos/ids/156101/72611.jpg"
    "80107"  = "https://torkco.vteximg.com.br/arquivos/ids/155863/80107_01.png"
    "201763" = "https://torkco.vteximg.com.br/arquivos/ids/155892/202019.jpg"
    "201764" = "https://torkco.vteximg.com.br/arquivos/ids/155892/202019.jpg"
    "200246" = "https://torkco.vteximg.com.br/arquivos/ids/155689/200852_01.jpg"
    "73554"  = "https://torkco.vteximg.com.br/arquivos/ids/155689/200852_01.jpg"
    "73553"  = "https://torkco.vteximg.com.br/arquivos/ids/155689/200852_01.jpg"
    "74079"  = "https://torkco.vteximg.com.br/arquivos/ids/155777/74729_01.jpg"
    "74167"  = "https://torkco.vteximg.com.br/arquivos/ids/155777/74729_01.jpg"
    "202223" = "https://torkco.vteximg.com.br/arquivos/ids/156094/72162.jpg"
    "200639" = "https://torkco.vteximg.com.br/arquivos/ids/156094/72162.jpg"
    "200690" = "https://torkco.vteximg.com.br/arquivos/ids/156094/72162.jpg"
    "72145"  = "https://torkco.vteximg.com.br/arquivos/ids/156094/72162.jpg"
    "72679"  = "https://torkco.vteximg.com.br/arquivos/ids/156094/72162.jpg"
    "72144"  = "https://torkco.vteximg.com.br/arquivos/ids/156094/72162.jpg"
    "200115" = "https://torkco.vteximg.com.br/arquivos/ids/156094/72162.jpg"
    "72506"  = "https://torkco.vteximg.com.br/arquivos/ids/156094/72162.jpg"
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
        Write-Host "[$i/$total] SKIP $codigo (ya existe)" -ForegroundColor Yellow
        continue
    }

    try {
        Write-Host "[$i/$total] Descargando $codigo..." -NoNewline
        Invoke-WebRequest -Uri $url -OutFile $filename -UseBasicParsing -ErrorAction Stop
        Write-Host " OK" -ForegroundColor Green
    } catch {
        Write-Host " ERROR: $_" -ForegroundColor Red
    }

    Start-Sleep -Milliseconds 300
}

Write-Host "`nDescarga completada. $total imagenes procesadas." -ForegroundColor Cyan
Write-Host "Directorio: $outputDir"
