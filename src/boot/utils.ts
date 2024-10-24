import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as pdfjs from 'pdfjs-dist';
import { boot } from 'quasar/wrappers';
// @ts-expect-error
import workerSrc from 'pdfjs-dist/build/pdf.worker?worker&url';

export default boot(() => {
  dayjs.extend(localizedFormat);
  dayjs.extend(relativeTime);

  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
});
