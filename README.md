# 5 Meses de Nós 💕

Site comemorativo dos 5 meses de namoro: linha do tempo, galeria de fotos, uma
cartinha e um quebra-cabeça deslizante que desbloqueia a fase final (a surpresa
do pedido de noivado).

## Estrutura

```
index.html          → estrutura da página
css/style.css        → estilos e responsividade
js/script.js         → pétalas animadas, scroll reveal, quebra-cabeça e confete
assets/img/          → fotos do casal
```

## Como adicionar suas fotos

Substitua os placeholders colocando arquivos com estes nomes em `assets/img/`:

- `mes1.jpg` até `mes5.jpg` → fotos da linha do tempo (uma por mês)
- `foto1.jpg` até `foto6.jpg` → fotos da galeria
- `puzzle.jpg` (opcional) → se existir, essa foto é usada como imagem do
  quebra-cabeça no lugar do placeholder ilustrado

Enquanto uma foto não existir, o site mostra automaticamente um placeholder
ilustrado (coração), então nada quebra visualmente.

## Como personalizar os textos

- Nomes/título: edite o `<h1>` dentro da seção `.hero` em `index.html`.
- Mensagens de cada mês: dentro de `#historia`, em cada `.timeline-text p`.
- Cartinha: seção `.letter-section`.
- Mensagem final (pedido de noivado): seção `#reveal` em `index.html`.

## Como rodar localmente

Basta abrir `index.html` no navegador, ou servir a pasta com um servidor
simples:

```bash
python3 -m http.server 8000
```

E acessar `http://localhost:8000`.

## Publicar com GitHub Pages

1. Vá em **Settings → Pages** no repositório.
2. Em "Source", selecione a branch desejada (ex.: `main`) e a pasta raiz `/`.
3. Salve — o GitHub vai gerar um link público para o site.
