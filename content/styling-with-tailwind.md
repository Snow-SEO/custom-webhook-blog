---
title: "Beautiful Styling with Tailwind CSS"
date: "2026-05-03"
excerpt: "How to use Tailwind CSS to create clean, responsive designs without leaving your HTML."
---

## Utility-First CSS

Tailwind CSS takes a utility-first approach to styling. Instead of writing custom CSS, you compose styles directly in your markup.

### The Benefits

1. **Rapid Development** — No context switching between HTML and CSS files
2. **Consistent Design** — Built-in design system with sensible defaults
3. **Small Bundles** — Purges unused styles in production

### A Simple Example

Here's how you might style a card component:

```html
<div class="rounded-xl border border-zinc-200 p-6 shadow-sm">
  <h2 class="text-xl font-semibold text-zinc-900">
    Card Title
  </h2>
  <p class="mt-2 text-zinc-600">
    Some descriptive text goes here.
  </p>
</div>
```

### Responsive Design Made Easy

Tailwind makes responsive design intuitive with breakpoint prefixes:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>
```

### Dark Mode

Adding dark mode support is as simple as prefixing utilities with `dark:`:

```html
<div class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
  Automatically adapts to the user's theme preference.
</div>
```

### Conclusion

Tailwind CSS pairs beautifully with Next.js. It keeps your codebase clean, your builds fast, and your designs consistent. Give it a try on your next project!
