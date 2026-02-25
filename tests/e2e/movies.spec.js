const { test } = require("../support");

const data = require("../support/fixtures/movies.json");
const { executeSQL } = require("../support/database");

test("deve poder cadastrar um novo filme", async ({ page }) => {
  
  // Arrange: delete movie if it already exists in the database
  const movie = data.create;
  executeSQL(`DELETE FROM movies WHERE title = '${movie.title}'`);

  // Login via UI
  await page.login.visit();
  await page.login.submit("admin@zombieplus.com", "pwd123");
  await page.movies.isLoggedIn();

  // Act: create movie via UI
  await page.movies.create(movie.title, movie.overview, movie.company, movie.release_year);

  // Assert: UI confirmation
  await page.toast.containText("Cadastro realizado com sucesso!");
});
