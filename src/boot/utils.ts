import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker?worker&url';
import { boot } from 'quasar/wrappers';

export default boot(() => {
  dayjs.extend(localizedFormat);
  dayjs.extend(relativeTime);

  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
});
