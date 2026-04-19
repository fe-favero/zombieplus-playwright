const { test, expect } = require("../support");

const data = require("../support/fixtures/movies.json");
const { executeSQL } = require("../support/database");
const { table } = require("node:console");

// test.beforeAll(async () => {
//   // Ensure the test movie does not exist before tests run
//   await executeSQL(`DELETE FROM movies`);
// });

test("deve poder cadastrar um novo filme", async ({ page }) => {
  // Arrange: delete movie if it already exists in the database
  const movie = data.create;

  await executeSQL(`DELETE FROM movies WHERE title = '${movie.title}'`);

  // Login via UI
  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  // Act: create movie via UI
  await page.movies.create(
    movie.title,
    movie.overview,
    movie.company,
    movie.release_year,
    movie.cover,
    movie.featured,
  );

  // Assert: UI confirmation
  await page.popup.haveText(
    `O filme '${movie.title}' foi adicionado ao catálogo.`,
  );
});

test("deve poder remover um filme existente", async ({ page, request }) => {
  // Arrange: ensure the movie to be removed exists in the database
  const movie = data.to_remove;
  await request.api.setToken();
  await request.api.postMovie(movie);

  // Login via UI
  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  // Act: remove movie via UI
  await page.movies.remove(movie.title);

  // Assert: UI confirmation
  await page.popup.haveText("Filme removido com sucesso.");
});

test("não deve cadastrar quando o titulo é duplicado", async ({
  page,
  request,
}) => {
  // // Arrange: delete movie if it already exists in the database
  // const movie = data.duplicate;
  // await request.api.setToken();
  // await request.api.postMovie(movie);

  // // Login via UI
  // await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  // await page.movies.create(
  //   movie.title,
  //   movie.overview,
  //   movie.company,
  //   movie.release_year,
  //   movie.cover,
  //   movie.featured,
  // );

  // // Assert: UI confirmation
  // await page.popup.haveText(
  //   `O título '${movie.title}' já consta em nosso catálogo. Por favor, verifique se há necessidade de atualizações ou correções para este item.`,
  // );
  const movie = data.duplicate;

  // 1. Arrange: Garante que o filme NÃO existe no banco (limpeza específica)
  await executeSQL(`DELETE FROM movies WHERE title = '${movie.title}'`);

  // 2. Arrange: Insere o filme via API para criar o cenário de duplicidade
  await request.api.setToken();
  await request.api.postMovie(movie);

  // 3. Act: Tenta cadastrar o MESMO filme via UI
  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");
  await page.movies.create(
    movie.title,
    movie.overview,
    movie.company,
    movie.release_year,
    movie.cover,
    movie.featured,
  );

  // 4. Assert: Agora o banco com certeza terá o filme, e a UI deve barrar
  await page.popup.haveText(
    `O título '${movie.title}' já consta em nosso catálogo. Por favor, verifique se há necessidade de atualizações ou correções para este item.`
  );
});

test("Não deve cadastrar quando os campos obrigatórios não forem preenchidos", async ({
  page,
}) => {
  // Login via UI
  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");

  // Act: attempt to create movie with empty fields
  await page.movies.goForm();
  await page.movies.submitForm();

  // Assert: validation error messages
  await page.movies.alertHaveText([
    "Campo obrigatório",
    "Campo obrigatório",
    "Campo obrigatório",
    "Campo obrigatório",
  ]);
});

test("deve realizar busca pelo termo zumbi", async ({ page, request }) => {
  const movies = data.search;

  await request.api.setToken();

  // movies.data.forEach(async (movie) => {
  //   await request.api.postMovie(movie);
  // });

  // Substituímos o forEach por for...of para o await funcionar
  for (const movie of movies.data) {
    // Limpamos o filme antes de tentar cadastrar via API para não dar erro 409 (Conflict)
    await executeSQL(`DELETE FROM movies WHERE title = '${movie.title}'`);
    await request.api.postMovie(movie);
  }

  await page.login.do("admin@zombieplus.com", "pwd123", "Admin");
  await page.movies.search(movies.input);
  await page.movies.tableHave(movies.outputs);
});
