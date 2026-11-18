// guarda as preferências da pessoa (tema, tamanho do texto e alto contraste) neste aparelho
// qualquer tela pode pedir essas informações com usePreferencias()
// [integração P11] aqui também foi colocado o tema Automático e a barrinha de tamanho do texto
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { Platform } from 'react-native';

// [integração P11] lê o tema do navegador ou do celular (sem erro de hidratação no Expo Web)
import { useColorScheme } from '@/hooks/use-color-scheme';

// [integração P11] 'sistema' = Automático (segue o tema do navegador ou do celular)
type Tema = 'claro' | 'escuro' | 'sistema';
type TamanhoFonte = 'pequena' | 'media' | 'grande';

type Preferencias = {
  tema: Tema;
  tamanhoFonte: TamanhoFonte;
  altoContraste: boolean;
  // [integração P11] tamanho do texto pela barrinha (1 = normal, 1.2 = 20% maior)
  escalaTexto: number;
};

// [integração P11] limites da barrinha de tamanho do texto (85% até 150%)
export const ESCALA_TEXTO_MIN = 0.85;
export const ESCALA_TEXTO_MAX = 1.5;

// [integração P11] converte os 3 tamanhos antigos pra um número e vice-versa
// (assim quem já tinha salvo Pequena/Média/Grande não perde a escolha)
function escalaDoTamanho(tamanho: TamanhoFonte) {
  return tamanho === 'pequena' ? 0.9 : tamanho === 'grande' ? 1.2 : 1;
}
function tamanhoDaEscala(escala: number): TamanhoFonte {
  return escala < 0.95 ? 'pequena' : escala > 1.1 ? 'grande' : 'media';
}
function limitarEscala(escala: number) {
  const arredondada = Math.round(escala * 20) / 20; // passos de 5%
  return Math.min(ESCALA_TEXTO_MAX, Math.max(ESCALA_TEXTO_MIN, arredondada));
}

type PreferenciasContexto = {
  preferencias: Preferencias;
  carregando: boolean;
  salvando: boolean;
  erro: string;
  atualizar: (alteracoes: Partial<Preferencias>) => Promise<void>;
  // [integração P11] quanto as telas devem multiplicar o tamanho da fonte
  // na web é sempre 1 pq lá o app inteiro já aumenta junto (zoom na raiz), aí não dobra
  escalaFonte: number;
  // [integração P11] o tema que ta valendo de verdade agora (o Automático vira claro ou escuro aqui)
  temaAtivo: 'claro' | 'escuro';
};

const CHAVE = '@fgrcm/preferencias/v1';

const padrao: Preferencias = {
  tema: 'claro',
  tamanhoFonte: 'media',
  altoContraste: false,
  escalaTexto: 1,
};

const Contexto = createContext<PreferenciasContexto | null>(null);

function validarDados(valor: unknown): Preferencias {
  if (typeof valor !== 'object' || valor === null) {
    return padrao;
  }

  const dados = valor as Record<string, unknown>;

  const tamanhoFonte: TamanhoFonte =
    dados.tamanhoFonte === 'pequena' || dados.tamanhoFonte === 'grande'
      ? dados.tamanhoFonte
      : 'media';

  return {
    // [integração P11] aceita também o Automático salvo antes
    tema:
      dados.tema === 'escuro' || dados.tema === 'sistema'
        ? dados.tema
        : 'claro',
    tamanhoFonte,
    altoContraste: dados.altoContraste === true,
    // [integração P11] se não tiver número salvo, usa o tamanho antigo (Pequena/Média/Grande)
    escalaTexto:
      typeof dados.escalaTexto === 'number' && Number.isFinite(dados.escalaTexto)
        ? limitarEscala(dados.escalaTexto)
        : escalaDoTamanho(tamanhoFonte),
  };
}

export function PreferenciasProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preferencias, setPreferencias] = useState(padrao);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const preferenciasRef = useRef(padrao);

  // [integração P11] tema do navegador/celular (no servidor e na hidratação começa claro)
  const temaDoSistema = useColorScheme();
  // se a pessoa escolheu Automático, usa o do sistema; senão usa o que ela escolheu
  const temaAtivo: 'claro' | 'escuro' =
    preferencias.tema === 'sistema'
      ? temaDoSistema === 'dark'
        ? 'escuro'
        : 'claro'
      : preferencias.tema;
  const ocupadoRef = useRef(false);

  // [integração P11] na web aumenta o app inteiro (texto, botões e ícones) pelo zoom da raiz
  // assim TODAS as telas acompanham a barrinha, até as que têm tamanho fixo
  // (testado no Chrome: a barra de baixo continua no lugar e só o conteúdo cresce)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const raiz = document.getElementById('root') ?? document.body;
    raiz.style.setProperty('zoom', String(preferencias.escalaTexto));
  }, [preferencias.escalaTexto]);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const salvo = await AsyncStorage.getItem(CHAVE);

        const dados =
          salvo === null
            ? padrao
            : validarDados(JSON.parse(salvo));

        if (ativo) {
          preferenciasRef.current = dados;
          setPreferencias(dados);
        }
      } catch {
        if (ativo) {
          setErro(
            'Não foi possível carregar as preferências salvas.'
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, []);

  async function atualizar(alteracoes: Partial<Preferencias>) {
    if (carregando || ocupadoRef.current) return;

    ocupadoRef.current = true;
    setSalvando(true);
    setErro('');

    const novasPreferencias = {
      ...preferenciasRef.current,
      ...alteracoes,
    };

    // [integração P11] mantém os dois jeitos de guardar o tamanho combinando
    if (alteracoes.escalaTexto !== undefined) {
      novasPreferencias.escalaTexto = limitarEscala(alteracoes.escalaTexto);
      novasPreferencias.tamanhoFonte = tamanhoDaEscala(novasPreferencias.escalaTexto);
    } else if (alteracoes.tamanhoFonte !== undefined) {
      novasPreferencias.escalaTexto = escalaDoTamanho(alteracoes.tamanhoFonte);
    }

    try {
      await AsyncStorage.setItem(
        CHAVE,
        JSON.stringify(novasPreferencias)
      );

      preferenciasRef.current = novasPreferencias;
      setPreferencias(novasPreferencias);
    } catch {
      setErro(
        'Não foi possível salvar a preferência. Tente novamente.'
      );
    } finally {
      ocupadoRef.current = false;
      setSalvando(false);
    }
  }

  return (
    <Contexto.Provider
      value={{
        preferencias,
        carregando,
        salvando,
        erro,
        atualizar,
        temaAtivo,
        escalaFonte: Platform.OS === 'web' ? 1 : preferencias.escalaTexto,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function usePreferencias() {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error(
      'usePreferencias precisa estar dentro de PreferenciasProvider.'
    );
  }

  return contexto;
}