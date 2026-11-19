// [integração 19/11] testa o escalarEstilos (tamanho do texto valendo nas telas do celular)
// roda com: node tests/teste-escala-texto.cjs
const path = require('path');
const raiz = process.argv[2] || path.join(__dirname, '..');
const ts = require('typescript');
const fs0 = require('fs'), Module = require('module');
// troca os imports da tela por versões falsas (o teste só precisa da função escalarEstilos)
const orig = Module._resolveFilename;
Module._resolveFilename = function (req, parent, ...r) {
  if (req === '@/features/p11-configuracoes/PreferenciasProvider') return '__prefs__';
  if (req === 'react') return '__react__';
  return orig.call(this, req, parent, ...r);
};
require.cache['__prefs__'] = { id: '__prefs__', filename: '__prefs__', loaded: true, exports: { usePreferencias: () => ({ escalaFonte: 1 }) } };
require.cache['__react__'] = { id: '__react__', filename: '__react__', loaded: true, exports: { useMemo: (f) => f() } };
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs0.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, f);
const { escalarEstilos } = require(path.join(raiz, 'src/components/escala-texto.ts'));

let f = 0;
function ok(cond, nome) { console.log((cond ? 'PASSOU ' : 'FALHOU ') + nome); if (!cond) f++; }

const base = {
  titulo: { fontSize: 20, lineHeight: 26, marginBottom: 10, color: '#000' },
  campo: { height: 47, fontSize: 16, borderWidth: 1 },
  caixa: { height: 120, padding: 12 },
  sigla: { width: 44, fontSize: 15 },
};
ok(escalarEstilos(base, 1) === base, 'escala 1: devolve o mesmo objeto (web e tamanho normal não mudam nada)');
ok(escalarEstilos(base, NaN) === base && escalarEstilos(base, 0) === base, 'escala inválida: não mexe');
const g = escalarEstilos(base, 1.5);
ok(g.titulo.fontSize === 30 && g.titulo.lineHeight === 39, 'fontSize e lineHeight crescem junto');
ok(g.titulo.marginBottom === 10 && g.titulo.color === '#000', 'margem e cor continuam iguais');
ok(g.campo.height === 70.5 && g.campo.borderWidth === 1, 'campo com texto e altura fixa cresce (não corta a letra)');
ok(g.caixa.height === 120, 'caixa sem texto não muda de tamanho');
ok(g.sigla.width === 66, 'largura fixa de caixinha de texto cresce junto');
ok(base.titulo.fontSize === 20, 'não estraga o estilo original (faz cópia)');
const p = escalarEstilos({ t: { fontSize: 15 } }, 0.85);
ok(p.t.fontSize === 12.8, 'texto menor arredonda pra 1 casa');

// conferência estática: todas as telas com tamanho de letra fixo usam a escala
const fs = require('fs');
const semEscala = [];
function andar(d) {
  for (const n of fs.readdirSync(d)) {
    const c = path.join(d, n);
    if (fs.statSync(c).isDirectory()) andar(c);
    else if (n.endsWith('.tsx')) {
      const t = fs.readFileSync(c, 'utf8');
      if (/fontSize/.test(t) && !/useEstilosEscalados|escalaFonte|useEscalaTexto/.test(t)) semEscala.push(path.relative(raiz, c));
    }
  }
}
for (const d of ['src/app', 'src/features', 'src/components']) andar(path.join(raiz, d));
// essas têm motivo pra ficar de fora (explicado no docs/melhorias-19-11-2026.md)
const PERMITIDAS = ['src/features/p11-configuracoes/BarraTamanhoTexto.tsx'];
const sobrando = semEscala.filter(a => !PERMITIDAS.includes(a.split(path.sep).join('/')));
ok(sobrando.length === 0, 'toda tela com tamanho de letra fixo acompanha a escala' + (sobrando.length ? ' (faltando: ' + sobrando.join(', ') + ')' : ''));

process.exitCode = f ? 1 : 0;
