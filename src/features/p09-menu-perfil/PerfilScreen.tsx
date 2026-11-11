// estado guarda o formulário e efeito mantém os dados atualizados
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, FormField, Notice, Page, UserGlyph } from '@/components/fgrc-ui';

// esses são os campos que o perfil conhece
export type ProfileData = {
  name: string;
  role: string;
  email: string;
  cityHall: string;
  city: string;
  state: string;
};

// dados fictícios só pra vc conseguir testar a tela sem login
export const DEMO_PROFILE: ProfileData = {
  name: 'Maria da Silva',
  role: 'Gestora municipal',
  email: 'maria@prefeitura.gov.br',
  cityHall: 'Prefeitura Municipal',
  city: 'Município',
  state: 'MG',
};

// controla qual parte do perfil aparece sem criar tela extra
type ProfileMode = 'view' | 'edit' | 'password';

// define os dados e as funções que o perfil recebe
type Props = {
  profile: ProfileData;
  onSaveProfile: (next: ProfileData) => void;
  onBack: () => void;
  // função opcional pra autenticação real no futuro (não ta conectada nessa previa)
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
};

// componente pequeno que mostra cada informação do perfil
function FieldDisplay({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  // pega a paleta clara ou escura
  const { colors } = useFgrcTheme();
  // o conteúdo muda de acordo com o modo escolhido
  return (
    <View style={[styles.infoField, !last && { borderBottomWidth: 1, borderColor: colors.divider }]}>
      <Text style={[styles.infoLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.muted }]}>{value}</Text>
    </View>
  );
}

// essa é a tela 18 do protótipo (Meu perfil)
export default function PerfilScreen({ profile, onSaveProfile, onBack, onChangePassword }: Props) {
  const { colors } = useFgrcTheme();
  // começa mostrando o perfil (edit e password só aparecem quando vc clicar)
  const [mode, setMode] = useState<ProfileMode>('view');
  // faz uma cópia temporária pra vc editar sem mudar o perfil antes de salvar
  const [draft, setDraft] = useState<ProfileData>(profile);
  // mensagem que aparece depois de salvar ou validar
  const [message, setMessage] = useState('');
  // erro de validação dos campos
  const [error, setError] = useState('');
  // guarda a senha atual somente enquanto o formulário ta aberto
  const [currentPassword, setCurrentPassword] = useState('');
  // guarda a nova senha digitada na prévia
  const [newPassword, setNewPassword] = useState('');
  // guarda a confirmação pra comparar com a nova senha
  const [confirmPassword, setConfirmPassword] = useState('');
  // impede envio duplicado quando a troca de senha ta processando
  const [saving, setSaving] = useState(false);

  // quando voltar pro modo de visualização atualiza a cópia dos dados
  useEffect(() => { if (mode === 'view') setDraft(profile); }, [profile, mode]);

  // prepara os dados e abre a edição do perfil
  function startEdit() {
    // copia os dados atuais (se vc cancelar nada muda)
    setDraft({ ...profile });
    setError('');
    setMessage('');
    setMode('edit');
  }

  // limpa as senhas antigas e abre o formulário de troca
  function startPassword() {
    // limpa a senha digitada assim que termina
    setCurrentPassword('');
    // limpa também a nova senha
    setNewPassword('');
    // limpa a confirmação pra não deixar nada no campo
    setConfirmPassword('');
    setError('');
    setMessage('');
    setMode('password');
  }

  // se ta vendo o perfil volta pro menu (se ta editando só fecha o formulário)
  function back() {
    if (mode === 'view') onBack();
    else { setError(''); setMessage(''); setMode('view'); }
  }

  // valida os dados antes de atualizar a demonstração
  function saveProfile() {
    // aqui tira espaços extras e normaliza o email
    const next = {
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim().toLowerCase(),
      cityHall: draft.cityHall.trim(),
      city: draft.city.trim(),
      state: draft.state.trim(),
    };
    // não deixa salvar campos importantes vazios
    if (!next.name || !next.cityHall || !next.city || !next.state) {
      setError('Preencha todos os campos do perfil.');
      return;
    }
    // faz uma validação simples do formato do email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
      setError('Digite um e-mail institucional válido.');
      return;
    }
    // atualiza os dados visíveis na prévia (não manda pro servidor)
    onSaveProfile(next);
    // depois de salvar volta pra visualização
    setMode('view');
    setError('');
    setMessage('Perfil atualizado nesta demonstração. Os dados permanecem apenas durante a prévia e não foram enviados ao servidor.');
  }

  // valida o formulário de senha (e só altera no servidor se tiver integração)
  async function savePassword() {
    // não deixa enviar duas vezes ao mesmo tempo
    if (saving) return;
    // primeiro confere se os três campos foram preenchidos
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Preencha os três campos de senha.');
      return;
    }
    // pede pelo menos oito caracteres na nova senha
    if (newPassword.length < 8) {
      setError('A nova senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    // confere se a confirmação bate com a nova senha
    if (newPassword !== confirmPassword) {
      setError('A confirmação não corresponde à nova senha.');
      return;
    }
    // evita escolher uma senha igual à atual
    if (currentPassword === newPassword) {
      setError('Escolha uma senha diferente da atual.');
      return;
    }
    // só pede a troca real se o backend estiver conectado
    if (onChangePassword) {
      setSaving(true);
      // espera o serviço de autenticação responder
      try { await onChangePassword(currentPassword, newPassword); }
      catch { setError('Não foi possível alterar a senha. Tente novamente.'); setSaving(false); return; }
      setSaving(false);
      setMessage('Senha atualizada pelo serviço de autenticação.');
    } else {
      // sem backend mostra que foi só uma validação (nada foi salvo)
      setMessage('Formulário validado. Modo demonstrativo: nenhuma senha real foi alterada ou armazenada.');
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setMode('view');
  }

  return (
    <Page title={mode === 'view' ? 'Meu perfil' : mode === 'edit' ? 'Editar perfil' : 'Alterar senha'} onBack={back}
      subtitle={mode === 'edit' ? 'Atualize seus dados nesta demonstração.' : mode === 'password' ? 'Confira os campos para simular a troca de senha.' : undefined}>
      {/* se ta no modo view mostra o resumo e os dados do perfil */}
      {mode === 'view' ? (
        <>
          {/* bloco com avatar nome e cargo */}
          <View style={styles.summary}>
            <View style={[styles.avatar, { backgroundColor: colors.iconBackground }]}><UserGlyph size={47} /></View>
            <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
            <Text style={[styles.role, { color: colors.muted }]}>{profile.role}</Text>
          </View>
          {/* lista email prefeitura e municipio da pessoa */}
          <View style={styles.details}>
            <FieldDisplay label="E-mail institucional" value={profile.email} />
            <FieldDisplay label="Prefeitura" value={profile.cityHall} />
            <FieldDisplay label="Município / Estado" value={`${profile.city} • ${profile.state}`} last />
          </View>
          {/* botões que abrem a edição e a troca de senha dentro do perfil */}
          <View style={styles.actions}>
            <FgrcButton label="Editar perfil" onPress={startEdit} />
            <View style={styles.buttonGap} />
            <FgrcButton label="Alterar senha" variant="outlined" onPress={startPassword} />
          </View>
          {message ? <Notice kind="success" message={message} onClose={() => setMessage('')} /> : null}
        </>
      ) : mode === 'edit' ? (
        <View style={styles.form}>
          {/* cada campo mexe só no rascunho (salva tudo no botão Salvar) */}
          <FormField label="Nome completo" value={draft.name} onChangeText={v => { setDraft(p => ({ ...p, name: v })); setError(''); }} />
          <FormField label="E-mail institucional" email value={draft.email} hint="No sistema definitivo, alterações de e-mail estarão sujeitas à aprovação." onChangeText={v => { setDraft(p => ({ ...p, email: v })); setError(''); }} />
          <FormField label="Prefeitura" value={draft.cityHall} onChangeText={v => { setDraft(p => ({ ...p, cityHall: v })); setError(''); }} />
          <FormField label="Município" value={draft.city} onChangeText={v => { setDraft(p => ({ ...p, city: v })); setError(''); }} />
          <FormField label="Estado" value={draft.state} onChangeText={v => { setDraft(p => ({ ...p, state: v })); setError(''); }} />
          {error ? <Notice kind="error" message={error} /> : null}
          <FgrcButton label="Salvar alterações" onPress={saveProfile} />
          <View style={styles.buttonGap} />
          <FgrcButton label="Cancelar" variant="outlined" onPress={() => setMode('view')} />
        </View>
      ) : (
        <View style={styles.form}>
          {/* esse aviso lembra pra vc não usar senha verdadeira na demonstração */}
          <Notice message="Apenas para demonstrar a interface: não digite sua senha verdadeira nesta prévia. A autenticação real será integrada pela equipe." />
          <View style={styles.formGap} />
          <FormField label="Senha atual" secure value={currentPassword} placeholder="Digite uma senha fictícia" onChangeText={v => { setCurrentPassword(v); setError(''); }} />
          <FormField label="Nova senha" secure value={newPassword} placeholder="Pelo menos 8 caracteres" onChangeText={v => { setNewPassword(v); setError(''); }} />
          <FormField label="Confirmar nova senha" secure value={confirmPassword} placeholder="Repita a nova senha" onChangeText={v => { setConfirmPassword(v); setError(''); }} />
          {error ? <Notice kind="error" message={error} /> : null}
          {/* botão que valida a senha e aguarda o retorno se tiver integração */}
          <FgrcButton label={saving ? 'Aguarde...' : 'Validar nova senha'} onPress={() => { void savePassword(); }} disabled={saving} />
          <View style={styles.buttonGap} />
          <FgrcButton label="Cancelar" variant="outlined" onPress={() => setMode('view')} />
        </View>
      )}
    </Page>
  );
}

// estilos do perfil (avatar campos e espaço entre os botões)
const styles = StyleSheet.create({
  // centraliza o nome avatar e cargo
  summary: { alignItems: 'center', marginTop: 3, marginBottom: 22 },
  avatar: { width: 86, height: 86, borderRadius: 43, alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  name: { fontSize: 23, fontWeight: '800', textAlign: 'center' },
  role: { fontSize: 15, marginTop: 5, textAlign: 'center' },
  // separa a parte das informações do perfil
  details: { marginTop: 4 },
  infoField: { paddingVertical: 17, minHeight: 75 },
  infoLabel: { fontSize: 14, marginBottom: 5 },
  infoValue: { fontSize: 15 },
  // distancia os botões do bloco de informações
  actions: { marginTop: 29 },
  buttonGap: { height: 11 },
  form: { marginTop: 6 },
  formGap: { height: 16 },
});
