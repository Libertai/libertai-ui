import { createUploaderComponent } from 'quasar'
import { computed } from 'vue'
import { useKnowledgeDBStore } from '../stores/knowledgeDB'

/* pdf upload example code:

async extractTextFromPdf(pdfUrl) {
            console.log("called")
            // set loading to true before processing the PDF
            this.loading = true;

            const pdf = await window.pdfjsLib.getDocument(pdfUrl).promise;
            console.log(pdf)
            const maxPages = pdf.numPages;
            let textContent = [];

            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageTextContent = content.items.map(item => item.str).join('');
                textContent.push(pageTextContent);
            }
            console.log("textContent")

            // set loading to false when the PDF processing is complete
            this.loading = false;

            return textContent.join('\n');
        },

        async handleFileUpload(event) {
            console.log(event)

            const file = event.target.files[0];
            const extension = file.name.split('.').pop();

            if (extension !== 'pdf') {
                alert('Please select a PDF file');
                return;
            }

            const reader = new FileReader();

            reader.onload = async () => {
                const dataUrl = reader.result;

                // set loading to true before extracting text from the PDF
                this.loading = true;

                const text = await this.extractTextFromPdf(dataUrl);
                this.extractedText = text;
                this.localValue.context_document = text;

                // set loading to false when the text extraction is complete
                this.loading = false;
            };

            reader.readAsDataURL(file);
        },

        */

// export a Vue component
export default createUploaderComponent({
  name: 'DBUploader',
  props: {
    // ...your custom props
  },
  emits: [
    // ...your custom events name list
  ],
  injectPlugin ({ props, emit, helpers }) {

    const loading = ref(false );

    async function extractTextFromPdf(pdfUrl) {
      console.log("called")
      // set loading to true before processing the PDF
      loading.value = true;

      const pdf = await window.pdfjsLib.getDocument(pdfUrl).promise;
      console.log(pdf)
      const maxPages = pdf.numPages;
      let textContent = [];

      for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageTextContent = content.items.map(item => item.str).join('');
          textContent.push(pageTextContent);
      }
      console.log("textContent")

      // set loading to false when the PDF processing is complete
      loading.value = false;

      return textContent.join('\n');
    }

    const isUploading = computed(() => {
      // return <Boolean>
      return false
    })

    const isBusy = computed(() => {
      // return <Boolean>
      return false
    })

    function abort () {
      // ...
    }

    async function upload () {
      console.log(props, emit, helpers)
      const files = helpers.files
      console.log(files)

      const useKnowledgeDB = useKnowledgeDBStore()
      console.log(useKnowledgeDB)

      // now for each file, handle it.
      for (let file of files) {
        console.log(file)
        if (file.type === 'application/pdf') {
          const reader = new FileReader()
          reader.onload = async (event) => {
            const content = event.target.result
            const text = await extractTextFromPdf(content)
            const title = file.name

            await useKnowledgeDB.addDocument(title, text)
          }
          reader.readAsText(file)
        } else if (file.type === 'text/plain') {
          const reader = new FileReader()
          reader.onload = async (event) => {
            const content = event.target.result
            const title = file.name
            await useKnowledgeDB.addDocument(title, content)
          }
          reader.readAsText(file)
        }
      }
      
      // const file = props.files[0]
      // if (file.type === 'application/pdf') {
      //   const reader = new FileReader()
      //   reader.onload = async (event) => {
      //     const content = event.target.result
      //     const title = file.name
      //     await useKnowledgeDB.addDocument(title, content)
      //   }
      //   reader.readAsText(file)
      // }
    }
    return {
      isUploading,
      isBusy,
      abort,
      upload
    }
  }
})