import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';

type Tema = 'claro' | 'escuro';
type TamanhoFonte = 'pequena' | 'media' | 'grande';

type Preferencias = {
  tema: Tema;
  tamanhoFonte: TamanhoFonte;
  altoContraste: boolean;
};

type PreferenciasContexto = {
  preferencias: Preferencias;
  carregando: boolean;
  salvando: boolean;
  erro: string;
  atualizar: (alteracoes: Partial<Preferencias>) => Promise<void>;
};

const CHAVE = '@fgrcm/preferencias/v1';

const padrao: Preferencias = {
  tema: 'claro',
  tamanhoFonte: 'media',
  altoContraste: false,
};

const Contexto = createContext<PreferenciasContexto | null>(null);

function validarDados(valor: unknown): Preferencias {
  if (typeof valor !== 'object' || valor === null) {
    return padrao;
  }

  const dados = valor as Record<string, unknown>;

  return {
    tema: dados.tema === 'escuro' ? 'escuro' : 'claro',
    tamanhoFonte:
      dados.tamanhoFonte === 'pequena' ||
      dados.tamanhoFonte === 'grande'
        ? dados.tamanhoFonte
        : 'media',
    altoContraste: dados.altoContraste === true,
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
  const ocupadoRef = useRef(false);

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