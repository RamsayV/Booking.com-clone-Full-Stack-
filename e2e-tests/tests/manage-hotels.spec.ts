import {test, expect, } from "@playwright/test"
import path from "path";

const UI_URL = "http://localhost:5173/";

test.beforeEach(async({page}) => {
    await page.goto(UI_URL);

  // get the sign in button
  await page.getByRole("link", { name: "Sign In" }).click();

  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  await page.locator("[name=email]").fill("FakeMan@gmail.com");
  await page.locator("[name=password]").fill("helloworld");

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Your Holiday Starts Today")).toBeVisible();
})

test("Should allow user to add hotels", async ({page})=> {
    await page.goto(`${UI_URL}add-hotel`)

    await page.locator('[name="name"]').fill("test Hotel")
    await page.locator('[name="city"]').fill("test city")
    await page.locator('[name="country"]').fill("test country")
    await page.locator('[name="description"]').fill("test cdescriptionsjcbdsCSDHC HDS CHS CHSD C")
    await page.locator('[name="pricePerNight"]').fill("100")

    await page.selectOption(' select[name="starRating"]', "3")

    await page.getByText("Budget").click()

    await page.getByLabel("Free Wifi").check()
    await page.getByLabel("Parking").check()

    await page.locator('[name="adultCount"]').fill("2")
    await page.locator('[name="childCount"]').fill("0")

    await page.setInputFiles('[name="imageFiles"]', [
        path.join(__dirname, "files", "1.jpg"),
        path.join(__dirname, "files", "2.jpeg")
    ])

    await page.getByRole('button', {name: "Save"}).click()
    await expect(page.getByText("Hotel Saved")).toBeVisible()
})

test("should display hotels", async({page}) => {
    await page.goto(`${UI_URL}my-hotels`)

    await expect(page.getByText("test Hotel")).toBeVisible();
    await expect(page.getByText("test cdescriptionsjcbdsCSDHC HDS CHS CHSD C")).toBeVisible();;
    await expect(page.getByText("test city, test country")).toBeVisible();
    await expect(page.getByText("Budget")).toBeVisible();
    await expect(page.getByText("£ 100 per night")).toBeVisible();
    await expect(page.getByText("2 adults, 0 children")).toBeVisible();
    await expect(page.getByText("3 Star Rating")).toBeVisible();

    await expect(page.getByRole("link", {name: "View Details"})).toBeVisible()
    await expect(page.getByRole("link", {name: "Add Hotel"})).toBeVisible()
})