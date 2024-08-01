import { boot } from 'quasar/wrappers';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

// @ts-expect-error
import workerSrc from 'pdfjs-dist/build/pdf.worker?worker&url';
import * as pdfjs from 'pdfjs-dist';

export default boot(() => {
  dayjs.extend(localizedFormat);
  dayjs.extend(relativeTime);

  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
});
