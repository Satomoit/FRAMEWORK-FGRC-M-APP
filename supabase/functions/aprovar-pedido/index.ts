// FGRC-M | função antiga, substituída pela admin-fgrcm (que confere admin pela tabela public.administradores e o MFA)
// ficou desligada de propósito pra não existir um segundo caminho com a chave secreta
// pode ser apagada no painel: Edge Functions > aprovar-pedido > Delete (e esta pasta pode sair do repositório)
Deno.serve(() => new Response(JSON.stringify({ erro: 'Função desativada. Use admin-fgrcm.' }), {
  status: 410,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
}));
