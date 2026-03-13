# Script de seed simple (PowerShell)

$BaseUrl = "http://localhost/api"

function Post-Json($Url, $Body) {
  return Invoke-RestMethod -Method Post -Uri $Url -ContentType "application/json" -Body ($Body | ConvertTo-Json)
}

function Get-OrCreateUser($User) {
  try {
    return Post-Json "$BaseUrl/users" $User
  } catch {
    $list = Invoke-RestMethod -Method Get -Uri "$BaseUrl/users"
    return $list | Where-Object { $_.username -eq $User.username } | Select-Object -First 1
  }
}

function Get-OrCreateProduct($Product) {
  try {
    return Post-Json "$BaseUrl/products" $Product
  } catch {
    $list = Invoke-RestMethod -Method Get -Uri "$BaseUrl/products"
    return $list | Where-Object { $_.name -eq $Product.name } | Select-Object -First 1
  }
}

Write-Host "Creation des utilisateurs..."
$users = @(
  @{ username = "alice"; email = "alice@example.com"; password = "secret" },
  @{ username = "bob"; email = "bob@example.com"; password = "secret" },
  @{ username = "charlie"; email = "charlie@example.com"; password = "secret" }
)
$createdUsers = @()
foreach ($u in $users) {
  $createdUsers += Get-OrCreateUser $u
}

Write-Host "Creation des produits..."
$products = @(
  @{ name = "Clavier"; price = 49.90; stock = 20 },
  @{ name = "Souris"; price = 19.90; stock = 30 },
  @{ name = "Ecran"; price = 159.90; stock = 10 }
)
$createdProducts = @()
foreach ($p in $products) {
  $createdProducts += Get-OrCreateProduct $p
}

Write-Host "Creation des commandes..."
$orders = @(
  @{ user = 0; product = 0; quantity = 2 },
  @{ user = 1; product = 1; quantity = 1 },
  @{ user = 2; product = 2; quantity = 1 }
)

foreach ($o in $orders) {
  $u = $createdUsers[$o.user]
  $p = $createdProducts[$o.product]
  if (-not $u -or -not $p) {
    Write-Host "Commande ignoree (user/product manquant)"
    continue
  }
  try {
    Post-Json "$BaseUrl/orders" @{ user_id = $u.id; product_id = $p.id; quantity = $o.quantity } | Out-Null
  } catch {
    Write-Host "Commande non creee (peut-etre deja creee ou stock insuffisant)"
  }
}

Write-Host "Seed termine."