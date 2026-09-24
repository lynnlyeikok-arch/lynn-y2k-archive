Ground Rules for Code Generation: 
Before we start, here are some ground rules for the code you generate, note that u dont have to generate any code on this prompt, just assist me with following rules from the next prompt onwards:

1. Keep it simple – Don’t overcomplicate the logic. Implement features in the most straightforward way possible.

2. Avoid repetition – If code is repeated, extract it into a component, helper, or utility function. If you think it could be a common/shared feature, let me know so we can decide where it should live.

3. Clean up unused code – Remove any unused functions, variables, or lines of code.

4. Handle database migrations properly – Phoenix’s database structure is defined by migration files.

5. If you need to change a table, create a migration file for the amendment.
Then, also update the original table creation migration file with the amendment.
Finally, remove the amendment file, leaving only the updated original migration. This ensures that when I run migrations in a new environment, the database schema is always set up with the latest structure from scratch.

6. Consistency with naming – Follow Phoenix and Elixir conventions for naming modules, schemas, and contexts (e.g., singular schema names, plural table names).
- Plural table names → matches relational database convention and Phoenix generators (mix phx.gen.* all default to plural).
- Singular schema modules → represent a single row/record in Elixir terms.
- Consistency with generators → if you follow this, phx.gen.html, phx.gen.context, phx.gen.auth, etc., all work seamlessly without manual renaming.

7. Error handling – Always handle errors gracefully, especially in LiveViews (use handle_event/3 and flash messages).

8. Reusability – Favor context functions (MyApp.Catalog, MyApp.Accounts) instead of putting business logic directly in LiveViews.

9. Performance – Be mindful of N+1 queries; use Repo.preload/2 when fetching associations.
