import { test, expect } from "@playwright/test";

test("sending message", async ({ page }) => {
  await page.goto("https://d17rdai9nc8x90.cloudfront.net/");

  const course = page.locator(
    ".text-xl.md\\:text-base.font-medium.group-hover\\:text-sky-700.transition.dark\\:group-hover\\:text-sky-500.line-clamp-2"
  );

  await course.click();

  const lesson = page.locator('img[alt="Lesson 1"]');

  await lesson.click();

  await page.fill(
    'textarea[placeholder="Enter your question..."]',
    "what is parallel computing"
  );

  await page.press('textarea[placeholder="Enter your question..."]', "Enter");

  await expect(
    page.locator(
      "div.flex.flex-col.space-y-2.text-base.max-w-md.mx-2.order-2.items-start"
    )
  ).toBeVisible({
    timeout: 30000,
  });

  await page.waitForTimeout(5000);
  await page.reload();
});

// create course
test("creating a course", async ({ page }) => {
  await page.goto("https://d17rdai9nc8x90.cloudfront.net/");

  const manageCourse = page.locator('button:has-text("Manage Courses")');

  await manageCourse.click();

  const newCourse = page.locator('button:has-text("New Course")');

  await newCourse.click();

  const inputSelector = page.locator(
    "input.flex.h-10.w-full.rounded-md.border.border-input.bg-background.px-3.py-2.text-sm.ring-offset-background.file\\:border-0.file\\:bg-transparent.file\\:text-sm.file\\:font-medium.placeholder\\:text-muted-foreground.focus-visible\\:outline-none.focus-visible\\:ring-2.focus-visible\\:ring-ring.focus-visible\\:ring-offset-2.disabled\\:cursor-not-allowed.disabled\\:opacity-50"
  );
  await inputSelector.fill("New course to test");

  const continueButton = page.locator('button:has-text("Continue")');

  await continueButton.click();

  const h1Element = page.locator("h1.text-2xl.font-medium");
  const h1Text = await h1Element.textContent();
  expect(h1Text).toContain("Course setup");

  // await page.waitForTimeout(5000);
  await page.reload();
});

// create lesson
test("creating a lesson", async ({ page }) => {
  await page.goto("https://d17rdai9nc8x90.cloudfront.net/");

  const manageCourse = page.locator('button:has-text("Manage Courses")');

  await manageCourse.click();

  const course = page.locator('img[alt="New course to test"]');

  await course.click();

  const addLesson = page.locator('button:has-text("Add a Lesson")');

  await addLesson.click();

  const inputSelector = page.locator('input[name="title"]');

  await inputSelector.fill("New lesson");

  const createButton = page.locator('button:has-text("Create")');

  await createButton.click();

  const element = await page
    .locator(
      ".flex.items-center.bg-gray-200.border-gray-200.border.text-gray-700.rounded-md.mb-4.text-sm"
    )
    .first();

  await expect(element).toBeVisible();

  // await page.waitForTimeout(5000);
  await page.reload();
});

// add student
test("adding a student", async ({ page }) => {
  await page.goto("https://d17rdai9nc8x90.cloudfront.net/");

  const manageCourse = page.locator('button:has-text("Manage Courses")');

  await manageCourse.click();

  const course = page.locator('img[alt="New course to test"]');

  await course.click();

  const addStudent = page.locator('button:has-text("Add a Student")');

  await addStudent.click();

  const inputSelector = page.locator('input[name="email"]');

  await inputSelector.fill("cqw@u.nus.edu");

  const createButton = page.locator('button:has-text("Create")');

  await createButton.click();

  const element = await page.locator('div:has-text("cqw@u.nus.edu")').first();

  await expect(element).toBeVisible();

  // await page.waitForTimeout(5000);
  await page.reload();
});

// delete student
test("deleting a student", async ({ page }) => {
  await page.goto("https://d17rdai9nc8x90.cloudfront.net/");

  const manageCourse = page.locator('button:has-text("Manage Courses")');

  await manageCourse.click();

  const course = page.locator('img[alt="New course to test"]');

  await course.click();

  const trashIcon = await page.locator(
    "svg.lucide.lucide-trash.w-4.h-4.cursor-pointer"
  );

  await trashIcon.click();

  await page.waitForTimeout(3000);

  const element = await page.locator('div:has-text("cqw@u.nus.edu")').first();
  await expect(element).not.toBeVisible();

  // await page.waitForTimeout(5000);
  await page.reload();
});

// delete lesson
test("deleting a lesson", async ({ page }) => {
  await page.goto("https://d17rdai9nc8x90.cloudfront.net/");

  const manageCourse = page.locator('button:has-text("Manage Courses")');

  await manageCourse.click();

  const course = page.locator('img[alt="New course to test"]');

  await course.click();

  const editLessonButton = await page.locator(
    "svg.lucide.lucide-pencil.w-4.h-4.cursor-pointer"
  );

  await editLessonButton.click();

  const trashIcon = await page.locator("svg.lucide.lucide-trash.h-4.w-4");

  await trashIcon.click();

  const confirmButton = page.locator('button:has-text("Confirm")');

  await confirmButton.click();

  const element = await page
    .locator(
      ".flex.items-center.bg-gray-200.border-gray-200.border.text-gray-700.rounded-md.mb-4.text-sm"
    )
    .first();

  await expect(element).not.toBeVisible();

  // await page.waitForTimeout(5000);

  await page.reload();
});

// delete course
test("deleting a course", async ({ page }) => {
  await page.goto("https://d17rdai9nc8x90.cloudfront.net/");

  const manageCourse = page.locator('button:has-text("Manage Courses")');

  await manageCourse.click();

  const course = page.locator('img[alt="New course to test"]');

  await course.click();

  const trashIcon = page.locator("svg.lucide.lucide-trash.h-4.w-4");

  await trashIcon.click();

  const confirmButton = page.locator('button:has-text("Confirm")');

  await confirmButton.click();

  await expect(course).not.toBeVisible();

  // await page.waitForTimeout(5000);
  await page.reload();
});

// signout
test("signing out", async ({ page }) => {
  await page.goto("https://d17rdai9nc8x90.cloudfront.net/");

  const signOutButton = page.locator('button:has-text("Sign Out")');

  await signOutButton.click();

  const signInButton = page.locator('button:has-text("Sign in")').first();
  await expect(signInButton).toBeVisible();

  // await page.waitForTimeout(5000);
  await page.reload();
});
