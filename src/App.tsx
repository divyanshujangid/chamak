import { useEffect } from 'react';
import { ProjectProvider, useProject, type Step } from './state/project';
import { usePhotoProcessing } from './state/processing';
import { ToastProvider } from './ui/Toast';
import { Upload } from './ui/Upload';
import { Picker } from './ui/Picker';
import { Editor } from './ui/Editor';
import { Done } from './ui/Done';
import { Privacy } from './ui/Privacy';

function Flow() {
  const { state, dispatch } = useProject();
  usePhotoProcessing();
  let step: Step = state.step;
  if (!state.photos.length) step = 'upload';
  else if ((step === 'edit' || step === 'done') && !state.templateId) step = 'pick';

  // Keep the phone's back button in sync with steps.
  useEffect(() => {
    if (history.state?.step !== step) history.pushState({ step }, '');
  }, [step]);
  useEffect(() => {
    const on = (e: PopStateEvent) => dispatch({ type: 'SET_STEP', step: (e.state?.step as Step) ?? 'upload' });
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, [dispatch]);
  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  return (
    <div className="app" data-step={step}>
      {step === 'upload' && <Upload />}
      {step === 'pick' && <Picker />}
      {step === 'edit' && <Editor />}
      {step === 'done' && <Done />}
    </div>
  );
}

export default function App() {
  if (location.pathname.startsWith('/privacy')) return <div className="app"><Privacy /></div>;
  return (
    <ProjectProvider>
      <ToastProvider>
        <Flow />
      </ToastProvider>
    </ProjectProvider>
  );
}
