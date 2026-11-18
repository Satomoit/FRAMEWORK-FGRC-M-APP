// [integração] rota /admin = área administrativa (separada do app, fora dos menus)
// o código de verdade ta em src/features/admin (login próprio, verificação em duas etapas e painel)
// essa rota é "pública" no app-navigation pq ela mesma mostra o login da administração
// quem decide se a pessoa é admin é o banco (tabela public.administradores), não o app
// a versão anterior desta tela (que conferia o app_metadata) ficou no backup da etapa de admin
import AreaAdministrativa from '@/features/admin/AreaAdministrativa';

export default AreaAdministrativa;
