// [integração B13] ajudinhas de texto que várias telas usam
// (ficam aqui sem tela nenhuma pra dar pra testar no npm test)

// escolhe singular ou plural pela quantidade
// ex: contagem(1, 'ponto de atenção', 'pontos de atenção') -> "1 ponto de atenção"
//     contagem(3, 'ponto de atenção', 'pontos de atenção') -> "3 pontos de atenção"
// (0 fica no plural, que é o certo em português: "0 pontos de atenção")
export function contagem(quantidade: number, singular: string, plural: string): string {
  return `${quantidade} ${Math.abs(quantidade) === 1 ? singular : plural}`;
}

// [integração 19/11] confirmação das exclusões da administração: a pessoa tem que digitar EXCLUIR
// compara sem ligar pra maiúscula/minúscula e espaço sobrando
// ("excluir" e " EXCLUIR " também valem, pq o teclado do celular às vezes começa com maiúscula sozinho)
export function palavraDeExclusaoConfere(texto: string): boolean {
  return texto.trim().toUpperCase() === 'EXCLUIR';
}
