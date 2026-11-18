// [integração] diz de onde o pedido ou a mensagem foi enviada (navegador, Android ou iPhone)
// a administração vê isso no painel; ajuda a entender um problema ("no celular não abre" etc)
// o banco só aceita esses três valores, qualquer outro vai vazio (null)
import { Platform } from 'react-native';

export function plataformaDoPedido(): 'web' | 'android' | 'ios' | null {
  return Platform.OS === 'web' || Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : null;
}
