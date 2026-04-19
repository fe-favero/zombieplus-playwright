const { test, expect } = require("../support/index");

const data = require("../support/fixtures/tvshows.json");
const { executeSQL } = require("../support/database");
const { table } = require("node:console");

// test.beforeAll(async () => {
//   // Ensure the test TV show does not exist before tests run
//   await executeSQL(`DELETE FROM tvshows`);
// });

test("deve poder cadastrar uma nova série", async ({ page }) => {
  // Arrange: delete TV show if it already exists in the database
  const tvshow = data.create;

  await executeSQL(`DELETE FROM tvshows WHERE title = '${tvshow.title}'`);

  // Login via UI
  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  // Act: Go to TV shows page and create TV show via UI
  await page.tvShows.goTvShows();
  await page.tvShows.goForm();

  await page.tvShows.create(
    tvshow.title,
    tvshow.overview,
    tvshow.company,
    tvshow.release_year,
    tvshow.seasons,
    tvshow.cover,
    tvshow.featured,
  );

  // Assert: UI confirmation
  await page.popup.haveText(
    `A série '${tvshow.title}' foi adicionada ao catálogo.`,
  );
});

test("deve poder remover uma série existente", async ({ page, request }) => {
  // Arrange: create the TV show via UI first
  const tvshow = data.to_remove;
  await request.api.setToken();
  await request.api.postTvShow(tvshow);

  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  await page.tvShows.goTvShows();
  
   // Act: remove the TV show via UI
  await page.tvShows.remove(tvshow.title);

  // Assert: UI confirmation
  await page.popup.haveText("Série removida com sucesso.");
});

test("não deve cadastrar quando a série é duplicada", async ({
  page, request
}) => {
  // Arrange: create the TV show via UI first
  const tvshow = data.duplicate;

  await executeSQL(`DELETE FROM tvshows WHERE title = '${tvshow.title}'`);

  await request.api.setToken();
  await request.api.postTvShow(tvshow);

  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  await page.tvShows.goTvShows();
  await page.tvShows.goForm();

  await page.tvShows.create(
    tvshow.title,
    tvshow.overview,
    tvshow.company,
    tvshow.release_year,
    tvshow.seasons,
    tvshow.cover,
    tvshow.featured,
  );

  // Assert: UI error message
  await page.tvShows.tvShowsHaveText(
    `O título '${tvshow.title}'  já consta em nosso catálogo. Por favor, verifique se há necessidade de atualizações ou correções para este item.`,
  );
});

test("Não deve cadastrar série sem preencher os campos obrigatórios", async ({
  page, request
}) => {
  // Login via UI
  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  // Act: Go to TV shows page and try to create TV show without filling required fields
  await page.tvShows.goTvShows();
  await page.tvShows.goForm();
  await page.tvShows.submitForm();

  // Assert: UI validation messages
  await page.tvShows.alertHaveText([
    "Campo obrigatório",
    "Campo obrigatório",
    "Campo obrigatório",
    "Campo obrigatório",
    "Campo obrigatório (apenas números)",
  ]);
});

test("deve realizar busca pelo termo dead", async ({ page, request }) => {
  // const tvshows = data.search;

  // await request.api.setToken();

  // // Arrange: ensure the TV shows to be searched exist in the database
  // tvshows.data.forEach(async (tvshow) => {
  //   await request.api.postTvShow(tvshow);
  // });

  // // Login via UI
  // await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  // // Act: Go to TV shows page and perform search via UI
  // await page.tvShows.goTvShows();
  // await page.tvShows.search(tvshows.input);
  // await page.tvShows.tableHave(tvshows.outputs);

  const tvshows = data.search;

  await request.api.setToken();

  // Arrange: limpar do banco e recriar as séries específicas da busca
  for (const tvshow of tvshows.data) {
    // 1. Deleta a série específica para garantir que a API não recuse por duplicidade
    await executeSQL(`DELETE FROM tvshows WHERE title = '${tvshow.title}'`);
    
    // 2. Insere a série via API
    await request.api.postTvShow(tvshow);
  }

  // Login via UI
  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  // Act: Go to TV shows page and perform search via UI
  await page.tvShows.goTvShows();
  await page.tvShows.search(tvshows.input);
  
  // Assert:
  await page.tvShows.tableHave(tvshows.outputs);
});
