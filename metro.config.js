// [integração B1c] configuração do Metro (o empacotador do Expo)
// só existe pra corrigir o erro "tslib.default is undefined" no navegador
// o problema: o Supabase usa o tslib, e no navegador o Metro escolhe o arquivo modules/index.js do tslib
// esse arquivo faz "import tslib from '../tslib.js'", só que o tslib.js não tem export default
// aí vem undefined e a tela quebra (bug conhecido do tslib com o Metro)
// a correção manda o Metro usar o tslib.es6.js, que tem as mesmas funções em formato ES (sem esse problema)
const fs = require("fs");
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // só mexe no navegador (web) e só no import "tslib" puro
  // o celular continua resolvendo do jeito normal, pq lá não dá erro
  if (platform === "web" && moduleName === "tslib") {
    // primeiro deixa o Expo achar qual pasta do tslib quem pediu usa
    // (o pdf-lib usa a cópia dele, 1.14.1, e o Supabase usa a 2.8.1)
    const padrao = context.resolveRequest(context, moduleName, platform);
    if (padrao.type === "sourceFile") {
      const marca = `${path.sep}node_modules${path.sep}tslib${path.sep}`;
      const fim = padrao.filePath.lastIndexOf(marca);
      if (fim >= 0) {
        // aponta direto pro arquivo (assim o Expo não fica avisando "not listed in exports")
        const es6 = padrao.filePath.slice(0, fim + marca.length) + "tslib.es6.js";
        if (fs.existsSync(es6)) return { type: "sourceFile", filePath: es6 };
      }
    }
    return padrao;
  }
  // todo o resto segue o caminho padrão do Expo
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
