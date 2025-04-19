<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require __DIR__ . '/firebase.php'; // Garante que Firebase esteja inicializado

use Google\Cloud\Firestore\FirestoreClient;

$db = new FirestoreClient([
  'projectId' => 'appconectaservegeral'
]);

$periodo = $_GET['periodo'] ?? 'dia';
$dataFiltro = $_GET['data'] ?? date('Y-m-d');

function agruparUsuarios($docs, $periodo) {
  $agrupado = [];

  foreach ($docs as $doc) {
    $data = $doc->data();
    if (!isset($data['criadoEm'])) continue;

    $timestamp = $data['criadoEm']->get()->getTimestamp();
    $dt = new DateTime();
    $dt->setTimestamp($timestamp);

    switch ($periodo) {
      case 'semana':
        $chave = $dt->format('o-\WW'); // Ex: 2024-W15
        break;
      case 'mes':
        $chave = $dt->format('Y-m');   // Ex: 2024-04
        break;
      case 'ano':
        $chave = $dt->format('Y');     // Ex: 2024
        break;
      default:
        $chave = $dt->format('Y-m-d'); // Ex: 2024-04-21
    }

    if (!isset($agrupado[$chave])) $agrupado[$chave] = 0;
    $agrupado[$chave]++;
  }

  ksort($agrupado);
  return $agrupado;
}

try {
  $usuariosRef = $db->collection('usuarios');
  $snapshot = $usuariosRef->documents();

  $dadosAgrupados = agruparUsuarios($snapshot, $periodo);

  echo json_encode([
    'sucesso' => true,
    'labels' => array_keys($dadosAgrupados),
    'valores' => array_values($dadosAgrupados)
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['erro' => 'Erro ao buscar usuários: ' . $e->getMessage()]);
}
