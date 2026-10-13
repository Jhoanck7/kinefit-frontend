Aquí tienes el contenido íntegro y textual del archivo **"Estándares Oficiales, Guías de Estilo y Buenas Prácticas para la Documentación de Código Fuente en Arquitecturas Frontend y Backend"**, transcrito exactamente como figura en el documento original:

---

### Estándares Oficiales, Guías de Estilo y Buenas Prácticas para la Documentación de Código Fuente en Arquitecturas Frontend y Backend

#### Filosofía y Principios Fundamentales de la Documentación en Código

La documentación integrada en el código fuente constituye la primera línea de defensa para garantizar la mantenibilidad, transferibilidad y calidad del software en organizaciones de ingeniería [cite: 1, 2, 3]. En el diseño de sistemas modernos, la documentación en código no debe entenderse como una transcripción literal de la lógica de programación, sino como la formalización de un contrato de interfaz entre el autor de un módulo y sus consumidores [cite: 3, 4, 5]. Para articular un marco normativo homogéneo en las capas frontend y backend, es imprescindible diferenciar la naturaleza semántica de los comentarios de implementación frente a los comentarios de documentación API [cite: 4, 6].

Los comentarios de implementación, acotados usualmente por prefijos de línea simple como // o #, están dirigidos exclusivamente a los desarrolladores que leen o modifican las tripas del algoritmo [cite: 4, 7]. Su propósito reside en clarificar decisiones de diseño no triviales, compromisos de rendimiento (_trade-offs_), deudas técnicas temporales o razones de negocio que justifican un patrón inusual [cite: 4, 8]. Por el contrario, los comentarios de documentación —estructurados bajo bloques delimitados formalmente por /** ... */, """ o ///— son procesados por compiladores y generadores de AST (_Abstract Syntax Tree_) para exponer contratos de uso pública o privadamente en editores mediante IntelliSense [cite: 5, 6, 9, 10, 11].

La masiva adopción del tipado estático mediante TypeScript, Type Hints en Python y características avanzadas en C# o Go ha redefinido el paradigma de los comentarios [cite: 4, 5, 11, 12]. Mientras que en lenguajes dinámicos tradicionales el comentario asumía la responsabilidad de especificar los tipos de datos de entrada y salida, la ingeniería moderna impone la regla de la no redundancia [cite: 4, 5, 12]. Cuando el sistema de tipos de un lenguaje expresa con precisión la estructura de los datos, el comentario de documentación debe omitir la declaración explicativa del tipo de dato y concentrarse en la intención de la función, las invariantes de ejecución, los efectos secundarios, las precondiciones, postcondiciones y los modos de fallo explícitos [cite: 4, 5, 11, 12, 13]. Documentar aspectos que el propio compilador verifica incrementa el costo de mantenimiento y propicia la aparición de documentación obsoleta o engañosa durante refactorizaciones [cite: 4, 13].

---

#### Estándares Oficiales y Convenciones para la Capa Frontend

##### Ecosistema JavaScript y TypeScript: Especificaciones JSDoc y TSDoc

En el desarrollo de la interfaz y servicios basados en Node.js o navegadores, JSDoc se ha consolidado históricamente como el formato estándar para documentar código JavaScript [cite: 5, 9, 14]. Sin embargo, la ausencia de una gramática especificada de forma rigurosa en JSDoc provocó inconsistencias cuando diversas herramientas intentaron extender la sintaxis para soportar TypeScript [cite: 9, 15]. Como respuesta, el proyecto TSDoc —impulsado por Microsoft junto con los equipos de TypeDoc, API Extractor y la comunidad de TypeScript— surgió con el objetivo de definir una norma universal para los comentarios en código fuertemente tipado [cite: 9, 15].

De acuerdo con las directrices oficiales establecidas por la guía de estilo de TypeScript de Google y el estándar TSDoc:

- **Símbolos Exportados** : Es obligatorio documentar todos los elementos exportados en el nivel superior de un módulo, como clases, interfaces, tipos, funciones y constantes públicas [cite: 4, 5]. Los componentes helpers internos pueden prescindir de bloques complejos si sus nombres son autoexplicativos [cite: 4, 5].
- **Omisión de Tipos en Bloques TypeScript** : Las etiquetas @param y @returns no deben incluir anotaciones de tipo entre llaves en archivos .ts, dado que el compilador deduce o verifica dichos tipos directamente de la firma [cite: 4, 5]. Esta restricción no aplica para código JavaScript vanila (.js), donde @param {string} name continúa siendo el mecanismo para proveer inferencia a los editores [cite: 5, 16].
- **Posicionamiento con Decoradores** : En arquitecturas orientadas a decoradores (como Angular, NestJS o librerías de componentes), los comentarios de documentación deben anteceder al decorador, asegurando que los analizadores de código no pierdan la asociación semántica con la clase o propiedad [cite: 4].

```typescript
// Aplicación del estándar TSDoc en un servicio TypeScript
/**
 * Servicio encargado de gestionar la sesión y el estado de autenticación del usuario.
 */
@Injectable()
export class AuthService {
  /**
   * Autentica a un usuario mediante credenciales y almacena el token en almacenamiento seguro.
   *
   * @param credentials - Identificadores primarios de acceso del usuario.
   * @param rememberMe - Indica si la sesión debe persistir tras cerrar el navegador.
   * @returns Promesa que resuelve con la sesión activa y los permisos asignados.
   * @throws {@link AuthenticationException} Se lanza cuando las credenciales son inválidas o el usuario está bloqueado.
   */
  public async login(
    credentials: UserCredentials,
    rememberMe: boolean = false
  ): Promise<UserSession> {
    // Implementación interna del procedimiento de autenticación...
  }
}
```

```javascript
// Aplicación del estándar JSDoc en un archivo JavaScript vanila (.js)
/**
 * Transforma una cadena de texto al formato slug apto para URL.
 * @param {string} text - La cadena de texto original.
 * @returns {string} El texto procesado en minúsculas y separado por guiones.
 */
function convertToSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-");
}
```

##### Componentes de Interfaz: Vue.js y React

La documentación en código de la interfaz de usuario exige un enfoque centrado en la anatomía del componente visual [cite: 5, 17]. En el marco de trabajo Vue.js, la arquitectura responde al principio fundamental _"Props down, events up"_ (las propiedades fluyen hacia abajo, los eventos hacia arriba) [cite: 18, 19, 20]. La herramienta oficial de parsing vue-docgen-api y ecosistemas como Vue Styleguidist establecen un conjunto de etiquetas JSDoc específicas para documentar componentes Single File Components (SFC) de Vue 3 (utilizando `<script setup>` o la Options API) [cite: 17]:

- @displayName: Asigna un nombre legible al componente en catálogos e inspecciones visuales [cite: 17].
- @values: Enumera el conjunto discreto de valores permitidos para una propiedad de tipo cadena [cite: 17].
- @model: Marca la propiedad específica que actúa como el enlace bidireccional cuando se utiliza la directiva v-model [cite: 17].
- @event / @arg: Documenta los eventos personalizados emitidos hacia el componente padre y los argumentos que acompañan la emisión [cite: 17].
- @binding: Explicita las variables expuestas en la plantilla a través de ranuras con ámbito (_scoped slots_) [cite: 17].
- @ignore: Excluye propiedades auxiliares de la interfaz pública documentada [cite: 17].

```vue
<script setup lang="ts">
/**
 * Componente de entrada de texto con soporte para validación visual y estados.
 * @displayName BaseInput
 */

interface Props {
  /**
   * Valor actual del campo de texto enlazado.
   * @model
   */
  modelValue: string;

  /**
   * Variante semántica del aspecto visual del campo.
   * @values default, success, error
   */
  variant?: "default" | "success" | "error";

  /**
   * Determina si el campo se encuentra deshabilitado para interacción.
   */
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  disabled: false,
});

const emit = defineEmits<{
  /**
   * Notifica el cambio de valor en el campo de texto hacia el componente padre.
   * @arg value - El nuevo texto ingresado por el usuario.
   */
  (e: "update:modelValue", value: string): void;
}>();
</script>
```

Para React, el procesamiento de comentarios reposa sobre la extracción de tipos en interfaces Props mediante react-docgen [cite: 5, 21, 22]. La buena práctica consolidada en la industria dicta que los componentes deben documentarse en código mediante TSDoc sobre sus tipos de entrada, complementando esta estructura con archivos de historias de Storybook (.stories.tsx) para la simulación interactiva de estados [cite: 5, 21].

| Estándar / Herramienta | Ámbito de Aplicación            | Sintaxis de Bloque             | Etiquetas Clave                                                 | Entregables Generados                                            |
| ---------------------- | ------------------------------- | ------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| **TSDoc**              | TypeScript (Frontend / Backend) | /** ... */                     | @param, @returns, @throws, @remarks, @defaultValue, @deprecated | TypeDoc, API Extractor, Tooltips de VS Code [cite: 9, 15]        |
| **JSDoc**              | JavaScript Vanila               | /** ... */                     | @param {type}, @returns {type}, @typedef, @type, @template      | JSDoc CLI, Documentation.js, Inferencia en IDE [cite: 5, 14, 16] |
| **Vue-Docgen**         | Componentes Vue.js (SFC)        | Comentarios en `<script>`      | @displayName, @values, @model, @event, @arg, @binding, @ignore  | Vue Styleguidist, Vue-docgen-cli [cite: 17]                      |
| **React Docgen**       | Componentes React               | TSDoc sobre Props / Interfaces | Comentarios estándar sobre miembros de tipos e interfaces       | Storybook Autodocs, React-docgen JSON [cite: 5, 21, 22]          |

---

#### Estándares Oficiales y Convenciones para la Capa Backend

##### Python: Las Específicas PEP 257 y PEP 8 para Docstrings

En el desarrollo de servicios backend en Python, la documentación interna no utiliza el formato JSDoc, sino el concepto nativo de _Docstrings_, formalizado en las propuestas de mejora **PEP 8** (Style Guide for Python Code) y **PEP 257** (Docstring Conventions) [cite: 7, 23, 24, 25].
Un docstring es un literal de cadena de texto que aparece como la primera declaración dentro de un módulo, función, clase o método, asignándose automáticamente al atributo especial `__doc__` en tiempo de ejecución [cite: 12, 24]. Las reglas normativas de PEP 257 estipulan:

- **Formato de Comillas** : Siempre deben utilizarse triples comillas dobles """ alrededor de los docstrings, incluso para descripciones que encajen en una sola línea física [cite: 7, 8, 23, 24]. Si la descripción contiene caracteres de barra invertida, debe emplearse el prefijo _raw_ r""" [cite: 24].
- **Docstrings de Una Línea** : Deben cerrarse en la misma línea que abren [cite: 7, 24]. La frase debe redactarse como una orden en **modo imperativo** ("Return the summary", no "Returns the summary") finalizada con un punto, evitando repetir los nombres de los parámetros de la firma [cite: 12, 24, 26].
- **Docstrings Multilínea** : Consisten en una línea de resumen en modo imperativo, seguida de una línea en blanco, un párrafo detallado explicativo y secciones estructuradas para argumentos, retornos y excepciones [cite: 12, 23, 24]. Las comillas de cierre """ deben reposar en una línea independiente [cite: 7, 24].

A nivel de ecosistema, los tres formatos de docstrings ampliamente aceptados para la extracción automática por herramientas como Sphinx o MkDocs son el formato **Google** (el más legible en código fuente mediante secciones como Args: y Returns:), el formato **NumPy** (ampliamente difundido en desarrollo científico) y el formato **reStructuredText (reST)** [cite: 12, 26]. Cabe destacar que desde Python 3.13, el compilador elimina automáticamente la sangría común de los docstrings en memoria, optimizando el consumo de espacio de los objetos `__doc__` [cite: 12].

##### C# / .NET: Comentarios de Documentación XML

En el ecosistema .NET, la documentación dentro del código se implementa mediante **comentarios XML**, procesados directamente por el compilador de C# (Roslyn) [cite: 10, 11, 27]. Los comentarios XML se posicionan inmediatamente sobre clases, interfaces, métodos, propiedades o campos, utilizando tres barras diagonales /// por línea [cite: 10, 27].
El compilador de C# ofrece una ventaja distintiva: efectúa validaciones sintácticas y de tipos en tiempo de compilación sobre las etiquetas XML [cite: 10, 11]. Si un desarrollador altera el nombre de un parámetro en un método pero olvida actualizar la etiqueta `<param name="...">`, o si una referencia dentro de un atributo `<see cref="..."/>` apunta a un símbolo inexistente, el compilador emite una advertencia formal [cite: 10, 11, 13].

- `<summary>`: Breve resumen informativo del elemento expuesto en las ventanas desplegables de IntelliSense [cite: 3, 11, 27].
- `<remarks>`: Explicaciones profundas sobre la implementación, consideraciones de hilos (_thread safety_) o algoritmos internos [cite: 11, 13, 27].
- `<param name="...">`: Documentación del propósito semántico de un parámetro [cite: 10, 11, 27].
- `<returns>`: Explicación del resultado retornado por la función [cite: 10, 11, 27].
- `<exception cref="...">`: Especificación de excepciones que la función puede desencadenar [cite: 13, 27].
- `<see cref="..."/>` y `<paramref name="..."/>`: Referencias cruzadas hacia otros tipos o parámetros que son verificadas estáticamente [cite: 3, 10, 11].

##### Go: Especificación de Go Doc Comments

El lenguaje Go aplica una filosofía estricta en la que la documentación forma parte integral de las herramientas de compilación e inspección mediante go doc [cite: 28, 29]. Un comentario de documentación en Go debe situarse en la línea inmediatamente superior a la declaración exportada (símbolos cuyo nombre inicia con letra mayúscula), sin líneas en blanco intermedias [cite: 28].
La actualización de Go 1.19 estandarizó la sintaxis para incluir elementos enriquecidos en los comentarios sin romper la simplicidad del código [cite: 28]:

- **Encabezados** : Declarados mediante el prefijo # precedido y seguido por saltos de línea.
- **Listas** : Formateadas mediante viñetas *, + o números ordenados 1...
- **Enlaces a Símbolos** : Acotados por corchetes simples [bytes.Buffer] o [pkg/path.Symbol], que generan hipervínculos automáticos en la plataforma pkg.go.dev y en los emergentes del IDE.
- **Bloques de Código** : Líneas con un nivel de sangría adicional (usando tabulador o espacios).

```go
// Package security proporciona primitivas para la verificación de tokens JWT.
package security

// TokenValidator evalúa la validez temporal y firma criptográfica de peticiones HTTP.
//
// # Seguridad
//
// Esta estructura utiliza algoritmos de curva elíptica ECDSA P-256.
// Para consultar la configuración por defecto, refiérase a [NewValidator].
type TokenValidator struct{}

// ValidateToken comprueba si el token recibido cumple con las políticas del sistema.
// Devuelve un error del tipo [ErrTokenExpired] si el tiempo de sesión ha concluido.
func (v *TokenValidator) ValidateToken(tokenString string) (bool, error) {
	// Implementación interna...
	return true, nil
}
```

| Lenguaje / Entorno | Formato Estandarizado           | Delimitador                | Validación e Inspección Estática                 | Generadores Automatizados                           |
| ------------------ | ------------------------------- | -------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| **Python**         | PEP 257 / Estilo Google / NumPy | """ (Triple comilla doble) | pydocstyle, flake8-docstrings                    | Sphinx, MkDocs (mkdocstrings) [cite: 12, 26, 30]    |
| **C# / .NET**      | XML Documentation               | /// (Triple barra)         | Compilador Roslyn (Verificación de cref y param) | DocFX, Sandcastle, Visual Studio [cite: 10, 11, 27] |
| **Go**             | Go Doc Comments                 | // (Barra doble en línea)  | go vet, gofmt, go doc                            | GoDoc, Pkg.go.dev [cite: 28, 29]                    |

---

#### Ciclo de Vida, Arquitectura de Publicación y CI/CD

Una arquitectura de documentación de software exitosa debe articular armónicamente cuatro artefactos diferenciados pero interconectados [cite: 5]:

1. **Documentación Inline (Comentarios de Código)** : Reside directamente en las líneas del código fuente y nutre la navegación interactiva en tiempo de desarrollo a través de las capacidades del IDE (Visual Studio Code, JetBrains, Visual Studio) [cite: 3, 5, 11].
2. **Referencia de API Generada** : Documentación técnica detallada extraída automáticamente mediante analizadores de código que procesan los bloques de comentarios para estructurar especificaciones públicas [cite: 5, 11, 27].
3. **Guías Conceptuales y Arquitectura** : Documentos redactados manualmente en Markdown o MDX que abordan flujos globales de trabajo, decisiones de arquitectura (ADRs), diagramas del sistema y guías de onboarding [cite: 5].
4. **Catálogos de Componentes Interactivos** : Entornos visuales aislados como Storybook que renderizan dinámicamente los estados y combinaciones de la interfaz de usuario [cite: 5, 17, 21].

La integración de la documentación en el flujo de Trabajo de Integración Continua y Despliegue Continuo (CI/CD) evita la obsolescencia técnica [cite: 5]. El proceso automatizado consta de cuatro fases clave:

- **Etapa de Linting y Análisis Estático** : Se ejecutan linters específicos en el pipeline para analizar la validez sintáctica de los comentarios antes de autorizar la fusión de un _pull request_. En JavaScript y TypeScript se aplican reglas de eslint-plugin-jsdoc o eslint-plugin-tsdoc [cite: 15]. En Python se utiliza pydocstyle para verificar la conformidad con PEP 257 [cite: 26, 30]. En .NET, la propiedad de compilación `<GenerateDocumentationFile>true</GenerateDocumentationFile>` convierte la ausencia de comentarios XML o inconsistencias en parámetros en advertencias del compilador (CS1591) que bloquean la integración [cite: 10, 11, 13].
- **Etapa de Extracción de Referencia** : La herramienta de extracción correspondiente (TypeDoc para TypeScript, Sphinx/mkdocstrings para Python, DocFX para .NET) analiza el código fuente parseando las anotaciones y generando archivos estáticos intermedios en formato Markdown o JSON [cite: 5, 11, 12].
- **Etapa de Unificación en Generadores de Sitios Estáticos (SSG)** : Los archivos de referencia generados automáticamente se inyectan dentro de una plataforma unificada impulsada por herramientas como Docusaurus, VitePress o Fumadocs [cite: 5]. Esto permite consolidar en un portal único tanto la referencia técnica extraída del código como las guías conceptuales escritas por el equipo [cite: 5].
- **Etapa de Publicación Automatizada** : El sitio web de documentación resultante se despliega de manera automatizada tras cada fusión en la rama principal hacia entornos de alojamiento estático como Cloudflare Pages, Vercel o AWS S3 [cite: 5].

---

#### Conclusiones y Marco de Gobernanza Estratégica

Para garantizar que el proyecto mantenga un estándar homogéneo de excelencia técnica en sus repositorios frontend y backend, se definen las siguientes directrices operativas de obligado cumplimiento:

##### Directrices para la Capa Frontend

1. **Adopción Estricta de TSDoc** : Todo el código TypeScript debe seguir la norma TSDoc [cite: 9, 15]. Queda prohibido replicar tipos de datos dentro de bloques de comentarios cuando estos ya estén explícitos en la firma del código [cite: 4, 5].
2. **Contratos Visuales Claros** : Los componentes de interfaz en Vue.js o React deben documentar sus contratos de entrada/salida (_props_, _events_, _slots_) utilizando las etiquetas JSDoc estandarizadas (@displayName, @values, @model, @event), asegurando su integración con herramientas de renderizado dinámico como Storybook [cite: 5, 17, 21].
3. **Documentación Obligatoria de Exportaciones** : Ningún símbolo (clase, función, interfaz) puede ser exportado en la API pública de un módulo sin poseer su correspondiente bloque de documentación /** ... */ [cite: 4, 5].

##### Directrices para la Capa Backend

1. **Conformidad Normativa en Python** : Todo código Python debe alinearse estrictamente con PEP 257 utilizando triples comillas dobles """ y la convención de estilo Google [cite: 7, 12, 23, 24]. Toda primera línea de un docstring debe redactarse en modo imperativo finalizada con punto [cite: 12, 23, 24].
2. **Comentarios XML Validados en .NET** : Se exige el uso de comentarios /// con las etiquetas `<summary>`, `<param>`, `<returns>` y `<exception>` en la totalidad de los miembros públicos [cite: 10, 11, 27]. Las referencias cruzadas se realizarán únicamente mediante `<see cref="..."/>` para permitir la verificación estática del compilador [cite: 3, 10, 11, 13].
3. **Enfoque en Excepciones y Modos de Fallo** : La documentación backend debe priorizar la explicación detallada de las excepciones que pueden lanzarse, las condiciones de límite y los efectos secundarios del código, delegando la explicación de la lógica básica al propio código que debe ser legible por sí mismo [cite: 5, 11, 12, 30].

##### Automatización y Control

- Es obligatorio integrar ejecutores de _pre-commit_ y tareas de análisis estático en el pipeline de CI/CD para impedir la incorporación de código carente de comentarios de documentación o con sintaxis defectuosa [cite: 5, 7, 11, 30].
- Se establece la separación estricta de responsabilidades: los comentarios en código enriquecen la productividad del desarrollador en su IDE y sirven de insumo para la compilación automatizada del portal web de documentación del proyecto [cite: 3, 5].

---

1. Type-safe JavaScript with JsDoc - Prisma, https://www.prisma.io/blog/type-safe-js-with-jsdoc-typeSaf3js
2. Comments vs self-documenting code - Jonathan Hall, https://jhall.io/archive/2024/02/16/comments-vs-self-documenting-code/
3. Using and Tag in C# XML Documentation Comments | Pluralsight, https://www.pluralsight.com/resources/blog/guides/using-param-paramref-tag-in-csharp-xml-documentation-comments
4. TypeScript style guide - TS.dev, https://ts.dev/style/
5. JavaScript Documentation: The 2026 Guide for JS and TS Teams - Docsio, https://docsio.co/blog/javascript-documentation
6. Google JavaScript Style Guide, https://google.github.io/styleguide/jsguide.html
7. PEP 8 – Style Guide for Python Code, https://peps.python.org/pep-0008/
8. A condensed version of PEP8 and PEP257 in notebook form - GitHubのGist, https://gist.github.com/bourque/5004594018c9bf16a821410f5c9327a7
9. TSDoc: A TypeScript Source Code Documentation Format - InfoQ, https://www.infoq.com/news/2018/04/tsdoc-format-announced/
10. Documentation comments - C# language specification - Microsoft Learn, https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/documentation-comments
11. Recommended XML documentation tags - C# reference - Microsoft Learn, https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/xmldoc/recommended-tags
12. docstrings | Python Best Practices, https://realpython.com/ref/best-practices/docstrings/
13. Best Practices for XML Documentation - NUnit Docs, https://docs.nunit.org/articles/developer-info/Best-practices-for-XML-documentation.html
14. Use JSDoc: Index, https://jsdoc.app/
15. What is TSDoc? | TSDoc, https://tsdoc.org/
16. JSDoc Reference - TypeScript: Documentation, https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
17. Documenting components - Vue Styleguidist, https://vue-styleguidist.github.io/docs/Documenting.html
18. Style Guide - Vue.js, https://vuejs.org/v2/style-guide/
19. Vue.js Props & Events Explained | Component Communication (Vue 3 Complete Guide), https://www.youtube.com/watch?v=PTCWDXqi_xo
20. Mastering Vue.js Component Communication: Props Down, Events Up - Medium, https://medium.com/@pirvan.marian/mastering-vue-js-component-communication-props-down-events-up-5a6e9f774d3e
21. Incorrect JSDoc for React component description in docs/mcp addons with Object.assign() · storybookjs storybook · Discussion #34351 - GitHub, https://github.com/storybookjs/storybook/discussions/34351
22. Accessing @decorator tags in component JSDoc comments · Issue #18162 · storybookjs/storybook - GitHub, https://github.com/storybookjs/storybook/issues/18162
23. Google Python Style Guide, https://google.github.io/styleguide/pyguide.html
24. PEP 257 – Docstring Conventions - Python Enhancement Proposals, https://peps.python.org/pep-0257/
25. PEP 8 Style Guide | Python - AlgoMaster.io, https://algomaster.io/learn/python/pep8-style-guide
26. What are the most common Python docstring formats? [closed] - Stack Overflow, https://stackoverflow.com/questions/3898572/what-are-the-most-common-python-docstring-formats
27. Comprehensive Guide to Documentation Comments in C# - DEV Community, https://dev.to/ravi-vishwakarma-hash/comprehensive-guide-to-documentation-comments-in-c-379d
28. Go Doc Comments in Quick Documentation - JetBrains Guide, https://www.jetbrains.com/guide/go/tips/quick-documentation-go-doc-comments/
29. The Go Code Review Comments List: 10 Rules Every Reviewer Cites - DEV Community, https://dev.to/gabrielanhaia/the-go-code-review-comments-list-10-rules-every-reviewer-cites-3kfd
30. Python coding standards — CKAN 2.9.11 documentation, https://docs.ckan.org/en/2.9/contributing/python.html
