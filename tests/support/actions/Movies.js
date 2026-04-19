import { expect } from "@playwright/test";

export class Movies {
  constructor(page) {
    this.page = page;
  }

  async submitForm() {
    await this.page.getByRole("button", { name: "Cadastrar" }).click();
  }

  async goForm() {
    await this.page.locator("a[href$='register']").click();
  }

  async create(
    title,
    overview,
    company,
    release_year,
    coverPath = null,
    featured = false,
  ) {
    await this.goForm();

    await this.page.getByLabel("Titulo do filme").fill(title);
    await this.page.getByLabel("Sinopse").fill(overview);

    await this.page
      .locator("#select_company_id .react-select__indicators")
      .click();

    await this.page
      .locator(".react-select__option")
      .filter({ hasText: company })
      .click();

    await this.page.locator("#select_year .react-select__indicators").click();

    await this.page
      .locator(".react-select__option")
      .filter({ hasText: release_year })
      .click();

    if (coverPath) {
      const normalizedCover = coverPath.startsWith("/")
        ? coverPath.slice(1)
        : coverPath;
      await this.page
        .locator("input[name=cover]")
        .setInputFiles(`tests/support/fixtures/${normalizedCover}`);
    }

    if (featured) {
      await this.page.locator(".featured .react-switch").click();
    }

    await this.submitForm();
  }

  async search(target) {
    await this.page.getByPlaceholder("Busque pelo nome").fill(target);

    await this.page.click(".actions button")
  }

  async tableHave(content){
    for (const text of content) {
      await expect(this.page.locator('tbody')).toContainText(text);
    }
  }
  
  async alertHaveText(target) {
    await expect(this.page.locator(".alert")).toHaveText(target);
  }

  async remove(title) {
    // Act: remove movie via UI
    await this.page
      .getByRole("row", { name: title })
      .getByRole("button")
      .click();
    await this.page.click(".confirm-removal");
  }
}
