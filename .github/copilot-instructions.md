You are an expert in TypeScript, NestJS, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following NestJS, Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

### Code Documentation

- JSDoc Usage:
  Only add JSDoc for **complex tools or utilities** where the purpose or usage isn’t immediately clear from the name or implementation. For simple functions, **good naming is sufficient**.

### Exports

- Services:
  A service should **only export its class**. Never export `const`, `type`, or `interface` directly from a service file.
- Constants:
  `const` values should be defined at the **top of the file** where they are used. If they are needed elsewhere, export them from a dedicated `xx.constants.ts` file.
- Types, Enums, and Interfaces:
  Define these in a `xx.model.ts` file.
  - Interfaces: Prefix with `I` (e.g., `ICat`).
  - Enums: Prefix with `E` (e.g., `ECat`).
  - Types: No prefix (e.g., `Cat`).
  - Enum Types: Derive types from enums:
    ```ts
    export type Cat = keyof typeof ECat;
    ```
  - Always prefer the **type derived from the enum** for typing. Use the enum itself only in code to reference values, never for typing.

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

### Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

### State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

### Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

### Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## NestJS Best Practices

### HTTP Calls

- Always type HTTP calls explicitly:
  ```ts
  httpService.get<ICat>(...);
  ```

### Mongoose Integration

- Document Validation:
  Use Mongoose decorators for validation:
  ```ts
  @Prop({ required: true, type: String, enum: Object.values(ECatType) })
  ```
- Schema Classes:
  Follow this pattern for Mongoose document classes:

  ```ts
  @Schema({ timestamps: true, collection: 'xxxxs', lean: true })
  export class XxxxDocument extends Document<string> implements IXxxx {
    ...
  }

  export const XxxxSchema = SchemaFactory.createForClass(XxxxDocument);
  ```

### DTOs (Data Transfer Objects)

- File Structure:
  Place DTOs in a `xx.dto.ts` file. Each DTO must **implement an interface** (create it in `xx.model.ts` if it doesn’t exist).
- Validation:
  Use **class-validator** decorators for validation.
- Nested Objects:
  For nested objects in DTOs:
  - Create a **separate DTO** for the nested object.
  - Use `@Type(() => SubDto)` and `@ValidateNested()` for proper validation.
  - Type the field using the **interface**:
    ```ts
    @Type(() => FieldDto)
    @ValidateNested()
    @IsNotEmptyObject()
    myField: IField;
    ```

### Controllers

(Reserved for future rules)

### Modules

(Reserved for future rules)

### Providers

(Reserved for future rules)
