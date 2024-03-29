window.fields = {
  input: (props) => `
  <div>
    <label
      for="link"
      class="block text-lg font-medium text-gray-300"
    >
      ${props.title}
    </label>
    <div class="mt-1 flex rounded-md shadow-sm">
      ${
        props.prefix
          ? `<span
        id="url"
        class="hidden md:inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300  text-gray-200 bg-green-900 text-sm"
      >
        ${props.prefix}
      </span>`
          : ""
      }
      <input
        type="text"
        name="${props.name}"
        id="${props.name}"
        oninput="${
          props.encode
            ? `event.target.value=encodeURI(decodeURI(event.target.value))`
            : ""
        }"
        class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300  text-gray-200 bg-green-900"
        placeholder="${props.placeholder ? props.placeholder : ""}"
        ${props.value ? "value=" + props.value : ""}
      />
    </div>
  </div>`,
  textarea: (props) => `
    <div>
    <label
      for="link"
      class="block text-lg font-medium text-gray-300"
    >
      ${props.title}
    </label>
    <div class="mt-1 flex rounded-md shadow-sm">
      ${
        props.prefix
          ? `<span
        id="url"
        class="hidden md:inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
      >
        ${props.prefix}
      </span>`
          : ""
      }
      <textarea
        name="${props.name}"
        id="${props.name}"
        oninput="${
          props.encode
            ? `event.target.value=encodeURI(decodeURI(event.target.value))`
            : ""
        }"
        class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
        placeholder="${props.placeholder ? props.placeholder : ""}"
      >${props.value ? props.value : ""}</textarea>
    </div>

  </div>`,
  markdown: (props) => `
  <div class="relative">
    <label
      for="about"
      class="block text-lg font-medium text-gray-300"
    >
      ${props.title}
    </label>

    <div
      class="bg-gray-50 border border-b-0 border-gray-300 top-0 left-0 right-0 block rounded-t-md"
    >
      <textarea hidden name="${props.name}" id="${props.name}">${props.value ? props.value : ""}</textarea>
      <div class="w-full">
        <div
          id="${props.name}-edit"
          class="edit w-full max-w-none rounded-t-md shadow-sm border border-gray-300 overflow-y-auto"
        ></div>
        <div style="text-align: center">Preview</div>
        <div
          id="${props.name}-edit-preview"
          class="w-full max-w-none rounded-b-md shadow-sm border border-gray-300 p-5 overflow-y-auto"
        ></div>
      </div>
    </div>
  </div>`,
  html: (props) => `
  <div class="relative">
    <label
      for="about"
      class="block text-lg font-medium text-gray-300"
    >
      ${props.title}
    </label>
    <div
      class="bg-gray-50 border border-b-0 border-gray-300 top-0 left-0 right-0 block rounded-t-md"
    >
      <textarea hidden name="${props.name}" id="${props.name}"></textarea>
      <div class="w-full">
        <div
          id="${props.name}-html"
          class="html"
        ></div>
        <div style="text-align: center">Preview</div>
        <div style='
        background-image: url("/bg.png");
        background-repeat: repeat;
        '>
            <div style="max-width:1000px; margin:auto;">
                <div style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content: space-evenly;">
                    <div class="shadow">
                        <div style="text-align: center;">
        <div
          id="${props.name}-html-preview"
          class="w-full"
        ></div>

        </div>
            </div>
        </div>
    </div>
    <div style=" display: flex; flex-direction: row; flex-wrap: wrap; justify-content: space-evenly;">

    </div>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css"
        integrity="sha512-HK5fgLBL+xu6dm/Ii3z4xhlSUyZgTT9tuc/hSrtw6uzJOvgRr2a9jyxxT1ely+B+xFAmJKVSTbpM/CuL7qxO8w=="
        crossorigin="anonymous">

</div>
      </div>
    </div>
  </div>`,
  hidden: (props)=> `
  <input name="${props.name}" id="${props.name}" type="hidden" />
  `,
  file: (props) => `
  <div class="space-y-1 text-center rounded-md shadow-sm border border-gray-300 p-5">
    <svg
      class="mx-auto h-12 w-12 text-gray-400"
      stroke="currentColor"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <div class="text-sm text-gray-600 text-center" onclick="document.getElementById('${props.name}-fileinput').click()">
      <p class="block text-lg font-medium text-gray-300">${props.title}</p>
      <label
        for="${props.name}"
        class="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
      >
        <p>Upload a file</p>
      </label>
      <img
        id="${props.name}-img"
        alt="img"
        style="display: none"
      />
      <input name="${props.name}" id="${props.name}" type="hidden" />
      <input type="file" id="${props.name}-fileinput" name="${props.name}-fileinput" class="sr-only" />
    </div>
  </div>`,
};
