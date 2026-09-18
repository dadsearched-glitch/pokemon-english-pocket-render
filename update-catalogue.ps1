$ErrorActionPreference = 'Stop'
$set = Invoke-RestMethod 'https://api.tcgdex.net/v2/en/sets/A1'
$cards = $set.cards | ForEach-Object -Parallel {
    $ErrorActionPreference = 'Stop'
    $cardId = $_.id
    $result = $null
    for ($attempt = 0; $attempt -lt 3; $attempt++) {
        try { $result = Invoke-RestMethod "https://api.tcgdex.net/v2/en/cards/$cardId"; break }
        catch { if ($attempt -eq 2) { throw }; Start-Sleep -Seconds 2 }
    }
    [pscustomobject]@{id=$result.id; name=$result.name; image=$result.image; rarity=$result.rarity; category=$result.category; dexId=$result.dexId; hp=$result.hp; types=$result.types}
} -ThrottleLimit 8
if ($cards.Count -ne 286 -or @($cards | Where-Object { !$_.image -or !$_.rarity }).Count) { throw 'Incomplete catalogue; preserving existing file.' }
$ordered = @($cards | Sort-Object { [int]($_.id -replace '^A1-', '') })
$json = ConvertTo-Json -InputObject $ordered -Depth 5 -Compress
$outputPath = Join-Path $PSScriptRoot 'web/a1-catalogue.js'
[IO.File]::WriteAllText($outputPath, "// TCGdex A1 metadata snapshot. Card images remain externally referenced.`nexport const A1_CATALOGUE=$json;`n", [Text.UTF8Encoding]::new($false))
$cards | Group-Object rarity | Select-Object Name,Count | ConvertTo-Json -Compress
