<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require __DIR__ . '/firebase.php';

use Google\Cloud\Firestore\FirestoreClient;

$db = new FirestoreClient([
  'projectId' => 'appconectaservegeral'
]);

$periodo = $_GET['periodo'] ?? 'dia';

function gerarChaveData($timestamp, $periodo) {
  $dt = new DateTime();
  $dt->setTimestamp($timestamp);

  switch ($periodo) {
    case 'semana':
      return $dt->format('o-\WW'); // Ex: 2024-W15
    case 'mes':
      return $dt->format('Y-m');   // Ex: 2024-04
    case 'ano':
      return $dt->format('Y');     // Ex: 2024
    default:
      return $dt->format('Y-m-d'); // Ex: 2024-04-21
  }
}

try {
  $usuariosRef = $db->collection('usuarios');
  $snapshot = $usuariosRef->documents();

  $agrupado = [];

  foreach ($snapshot as $doc) {
    $data = $doc->data();
    if (!isset($data['createdAt']) || !isset($data['tipo'])) continue;

    $timestamp = $data['createdAt']->get()->getTimestamp();
    $chave = gerarChaveData($timestamp, $periodo);
    $tipo = $data['tipo'];

    if (!isset($agrupado[$chave])) {
      $agrupado[$chave] = ['clientes' => 0, 'prestadores' => 0];
    }

    if ($tipo === 'cliente') $agrupado[$chave]['clientes']++;
    if ($tipo === 'prestador') $agrupado[$chave]['prestadores']++;
  }

  ksort($agrupado);

  $labels = [];
  $clientes = [];
  $prestadores = [];

  foreach ($agrupado as $data => $quantidades) {
    $labels[] = $data;
    $clientes[] = $quantidades['clientes'];
    $prestadores[] = $quantidades['prestadores'];
  }

  echo json_encode([
    'sucesso' => true,
    'labels' => array_map(fn($d) => ['data' => $d, 'clientes' => 0, 'prestadores' => 0], $labels),
    'clientes' => $clientes,
    'prestadores' => $prestadores
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['erro' => 'Erro ao buscar usuários: ' . $e->getMessage()]);
}
