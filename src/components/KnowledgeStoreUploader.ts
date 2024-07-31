// import { createUploaderComponent } from 'quasar';
// import { computed, ref } from 'vue';
//
// import { chatTag } from 'src/utils/chat';
//
// // State
// import { useKnowledgeStore } from 'src/stores/knowledge-store';
//
//
// export type AttachmentAddedEvent = {
//   title: string;
//   type: string;
// } & ({ documentId: string } | { content: string });
//
// export default createUploaderComponent({
//   name: 'KnowledgeStoreUploader',
//   props: {
//     chatRef: {
//       type: Object,
//       required: true,
//     },
//   },
//   emits: ['attachment-added'],
//   injectPlugin({ props, emit, helpers }) {
//     const loading = ref(false);
//     const chatId = props.chatRef.id;
//
//     // Map of file objects to their status as either 'queued', 'uploading', 'embedding', 'uploaded', or 'failed'
//     const fileStatus = ref({});
//
//     // Upload Logic
//     // TODO: we should be feeding the chat id through here, not through props
//     //  We're gonna need a way to add more custom tags to the documents
//     async function upload(_args) {
//       // Set the loading state
//       loading.value = true;
//       const files = helpers.queuedFiles.value;
//       fileStatus.value = {};
//       fileStatus.value = files.reduce((acc, file) => {
//         acc[file.name] = 'queued';
//         return acc;
//       });
//
//       // Load our state
//       const knowledgeStore = useKnowledgeStore();
//
//       let uploads = [];
//       // TODO: workers would be preferred here
//       // Handle Each File in Sequence
//       for (let file of files) {
//         let result = async () => {
//           try {
//             fileStatus.value[file.name] = 'uploading';
//             helpers.updateFileStatus(file, 'uploading');
//             let { title, text, type } = await processFile(file);
//             // Check how big the file is
//             // If the text is less than 4 KiB, then just inline it
//             if (text.length < 4 * 1024) {
//               fileStatus.value[file.name] = 'uploaded';
//               helpers.updateFileStatus(file, 'uploaded');
//               // If you don't embed the document, make sure to set the content
//               emit('attachment-added', { title, type, content: text });
//               return;
//             }
//
//             // Embed the document
//             fileStatus.value[file.name] = 'embedding';
//             helpers.updateFileStatus(file, 'embedding');
//             let tag = chatTag(chatId);
//             let { id } = await knowledgeStore.addDocument(title, text, [tag]);
//             let documentId = id;
//             fileStatus.value[file.name] = 'uploaded';
//             helpers.updateFileStatus(file, 'uploaded');
//             emit('attachment-added', { title, documentId, type });
//           } catch (error) {
//             console.error(error);
//             fileStatus.value[file.name] = 'failed';
//             helpers.updateFileStatus(file, 'failed');
//             console.error(`components::KnowledgeStoreUploader::upload - error: ${error}`);
//           }
//         };
//         uploads.push(result());
//       }
//       // Resolve all uploads
//       await Promise.all(uploads);
//       // Reset the loading state
//       loading.value = false;
//     }
//
//     const isUploading = computed(() => {
//       // return <Boolean>
//       return loading.value;
//     });
//
//     const isBusy = computed(() => {
//       // return <Boolean>
//       return loading.value;
//     });
//
//     function abort() {
//       fileStatus.value = {};
//     }
//
//
//
//     return {
//       isUploading,
//       isBusy,
//       abort,
//       upload,
//     };
//   },
// });
