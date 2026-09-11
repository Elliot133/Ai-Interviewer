import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import Navbar from '../components/Navbar';
import Select from '../components/Select';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { createInterview } from '../services/interviewService';
import { extractErrorMessage } from '../services/api';

const JOB_ROLES = [
  'Software Developer', 'Java Developer', 'Backend Developer', 'Frontend Developer',
  'Full Stack Developer', 'Data Analyst', 'Data Scientist', 'Cybersecurity Analyst',
  'Product Manager', 'UI/UX Designer', 'Marketing Specialist', 'Accountant',
  'Customer Service Representative', 'Custom role...',
];

const EXPERIENCE_LEVELS = ['Beginner', 'Junior', 'Intermediate', 'Senior', 'Expert'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const INTERVIEW_TYPES = ['Technical', 'Behavioral', 'HR', 'Mixed'];
const QUESTION_COUNTS = [5, 10, 15, 20];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [jobRole, setJobRole] = useState(JOB_ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [difficulty, setDifficulty] = useState('Medium');
  const [interviewType, setInterviewType] = useState('Mixed');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [jobDescription, setJobDescription] = useState('');
  const [focusSkills, setFocusSkills] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const resolvedRole = jobRole === 'Custom role...' ? customRole.trim() : jobRole;
    if (!resolvedRole) {
      setError('Please enter a job role.');
      return;
    }

    setLoading(true);
    try {
      const interview = await createInterview({
        jobRole: resolvedRole,
        experienceLevel,
        difficulty,
        interviewType,
        numberOfQuestions: Number(numberOfQuestions),
        jobDescription,
        focusSkills,
      });
      navigate(`/interview/${interview.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container setup-page">
        <h1>Set up your interview</h1>
        <p className="setup-subtitle">Tell us what you'd like to practice, and the AI will build a tailored interview.</p>

        <form onSubmit={handleSubmit} className="setup-form">
          <Select label="Job role" value={jobRole} onChange={(e) => setJobRole(e.target.value)}
            options={JOB_ROLES.map((r) => ({ value: r, label: r }))} />

          {jobRole === 'Custom role...' && (
            <Input label="Custom job role" value={customRole} onChange={(e) => setCustomRole(e.target.value)} placeholder="e.g. DevOps Engineer" />
          )}

          <div className="grid-2">
            <Select label="Experience level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}
              options={EXPERIENCE_LEVELS.map((v) => ({ value: v, label: v }))} />
            <Select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
              options={DIFFICULTIES.map((v) => ({ value: v, label: v }))} />
          </div>

          <div className="grid-2">
            <Select label="Interview type" value={interviewType} onChange={(e) => setInterviewType(e.target.value)}
              options={INTERVIEW_TYPES.map((v) => ({ value: v, label: v }))} />
            <Select label="Number of questions" value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(e.target.value)}
              options={QUESTION_COUNTS.map((v) => ({ value: v, label: `${v} questions` }))} />
          </div>

          <Textarea label="Job description (optional)" rows={4} value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste a job description to tailor the questions further..." />

          <Input label="Skills to focus on (optional)" value={focusSkills}
            onChange={(e) => setFocusSkills(e.target.value)} placeholder="e.g. Spring Boot, REST APIs, SQL" />

          {error && <ErrorMessage message={error} />}

          <Button type="submit" icon={Rocket} size="lg" disabled={loading}>
            {loading ? 'Preparing your interview...' : 'Start Interview'}
          </Button>
        </form>
      </div>

      <style>{`
        .setup-page { padding: 32px 24px 60px; max-width: 720px; }
        .setup-subtitle { color: var(--color-ink-soft); margin: 6px 0 28px; }
        .setup-form { display: flex; flex-direction: column; gap: 4px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 560px) { .grid-2 { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
