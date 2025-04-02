import React, { useState, useRef } from 'react';

// Define proper interfaces for type safety
interface CurrentField {
  section: string;
  index: number | null;
  key: string | null;
}

interface Instructor {
  name: string;
  course: string;
}

interface TableData {
  header: {
    facultyName: string;
    department: string;
    year: string;
    semester: string;
    code: string;
  };
  days: string[];
  dates: string[];
  rooms: string[];
  morningExams: string[];
  afternoonRooms: string[];
  afternoonExams: string[];
  examDetails: {
    rooms: string[];
    coordinator: string;
    instructors: Instructor[];
  };
}

const ExamScheduleCreator: React.FC = () => {
  // Initial state based on the template
  const [tableData, setTableData] = useState<TableData>({
    header: {
      facultyName: "Faculté des Sciences de Tunis",
      department: "Ingénieur en Informatique (Genie Logiciel)",
      year: "Deuxième Année | Examens",
      semester: "Premier semestre / Session Principale",
      code: "IGL 4"
    },
    days: ["Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Lundi"],
    dates: ["07/01/2025", "08/01/2025", "09/01/2025", "10/01/2025", "11/01/2025", "13/01/2025"],
    rooms: ["IGL S42", "IGL S21", "IGL S32", "IGL S31", "IGL S12", "IGL S22"],
    morningExams: [
      "Technologies web et Multimedia",
      "Conception et Mise en Oeuvre des SID",
      "Architecture & Algo Parallèle",
      "SOA & Cloud",
      "Processus Stochastique",
      "Intelligence Artificielle"
    ],
    afternoonRooms: ["IGL S53", "IGL S11", "IGL S61", "IGL S41", "", ""],
    afternoonExams: [
      "Gestion d'entreprise",
      "Optimisation Combinatoire",
      "Blockchain",
      "Cryptographie et Securité",
      "",
      ""
    ],
    examDetails: {
      rooms: ["S31", "13", "Dep Math1", "45", "", ""],
      coordinator: "Asma Amdouni",
      instructors: [
        { name: "Ayman Selaouti", course: "Wejda Ochi" },
        { name: "Asma Amdouni", course: "Henda Alsya" },
        { name: "Yosr Slama", course: "Hela Kaffal" },
        { name: "Haitham Abbess", course: "Hela Kaffal" },
        { name: "Sana Younes", course: "" },
        { name: "Narics Douaga", course: "" }
      ]
    }
  });

  const [editMode, setEditMode] = useState(false);
  // Fix the state type definition to match how it's used
  const [currentField, setCurrentField] = useState<CurrentField>({ 
    section: '', 
    index: null, 
    key: null 
  });
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [dragItem, setDragItem] = useState<{ section: string; index: number } | null>(null);

  // Handle drag
  const handleDragStart = (e: React.DragEvent, section: string, index: number) => {
    setDragItem({ section, index });
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
  };
  const handleDragOver = (e: React.DragEvent, section: string, index: number) => {
    e.preventDefault();
    if (!dragItem || dragItem.section !== section) return;
    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px #4299e1";
  };
  const handleDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.boxShadow = "none";
  };
  const handleDrop = (e: React.DragEvent, section: string, index: number) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.boxShadow = "none";
    if (!dragItem || dragItem.section !== section || dragItem.index === index) return;

    const updated = [...(tableData as any)[section]];
    const [removed] = updated.splice(dragItem.index, 1);
    updated.splice(index, 0, removed);

    setTableData({ ...tableData, [section]: updated });
    setDragItem(null);
  };

  // Handle editing
  const handleEditStartFn = (section: string, index: number | null, key: string | null = null) => {
    if (!editMode) {
      setEditMode(true);
      setCurrentField({ section, index, key });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { section, index, key } = currentField;
    const value = e.target.value;

    if (key) {
      if (section === 'examDetails' && key === 'instructors' && index !== null) {
        const updatedInstructors = [...tableData.examDetails.instructors];
        if (e.target.name === 'name') {
          updatedInstructors[index].name = value;
        } else {
          updatedInstructors[index].course = value;
        }
        setTableData({
          ...tableData,
          examDetails: { ...tableData.examDetails, instructors: updatedInstructors }
        });
      } else if (section === 'examDetails' && index !== null) {
        const arr = [...(tableData.examDetails as any)[key]];
        arr[index] = value;
        setTableData({
          ...tableData,
          examDetails: { ...tableData.examDetails, [key]: arr }
        });
      } else if (section === 'header') {
        setTableData({
          ...tableData,
          header: { ...tableData.header, [key]: value }
        });
      }
    } else {
      const arr = [...(tableData as any)[section]];
      if (index !== null) arr[index] = value;
      setTableData({ ...tableData, [section]: arr });
    }
  };
  const handleEditFinish = () => {
    setEditMode(false);
  };

  // Export example
  const exportAsImage = () => {
    alert('Export functionality would be implemented with html-to-image or a similar library.');
  };

  return (
    <div>
      {/* Main table container */}
      <div>
        <table>
          <thead>
            <tr>
              <td colSpan={2}>
                {/* Faculty name */}
                <div>
                  <span
                    onClick={() => handleEditStartFn('header', null, 'facultyName')}
                  >
                    {editMode && currentField.section === 'header' && currentField.key === 'facultyName' ? (
                      <input
                        ref={inputRef}
                        value={tableData.header.facultyName}
                        onChange={handleEditChange}
                        onBlur={handleEditFinish}
                      />
                    ) : tableData.header.facultyName}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                {/* Department, year, semester */}
                <div>
                  <span onClick={() => handleEditStartFn('header', null, 'department')}>
                    {editMode && currentField.section === 'header' && currentField.key === 'department' ? (
                      <input
                        ref={inputRef}
                        value={tableData.header.department}
                        onChange={handleEditChange}
                        onBlur={handleEditFinish}
                      />
                    ) : tableData.header.department}
                  </span>
                </div>
              </td>
              <td>
                {/* Exam code */}
                <span onClick={() => handleEditStartFn('header', null, 'code')}>
                  {editMode && currentField.section === 'header' && currentField.key === 'code' ? (
                    <input
                      ref={inputRef}
                      value={tableData.header.code}
                      onChange={handleEditChange}
                      onBlur={handleEditFinish}
                    />
                  ) : tableData.header.code}
                </span>
              </td>
            </tr>
          </thead>
          <tbody>
            {/* Days row */}
            <tr>
              <td>Journée</td>
              <td>
                <div>
                  {tableData.days.map((day, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'days', i)}
                      onDragOver={(e) => handleDragOver(e, 'days', i)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'days', i)}
                      onClick={() => handleEditStartFn('days', i)}
                    >
                      {editMode && currentField.section === 'days' && currentField.index === i ? (
                        <input
                          ref={inputRef}
                          value={day}
                          onChange={handleEditChange}
                          onBlur={handleEditFinish}
                        />
                      ) : day}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
            {/* Dates row */}
            <tr>
              <td>Date</td>
              <td>
                <div>
                  {tableData.dates.map((date, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'dates', i)}
                      onDragOver={(e) => handleDragOver(e, 'dates', i)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'dates', i)}
                      onClick={() => handleEditStartFn('dates', i)}
                    >
                      {editMode && currentField.section === 'dates' && currentField.index === i ? (
                        <input
                          ref={inputRef}
                          value={date}
                          onChange={handleEditChange}
                          onBlur={handleEditFinish}
                        />
                      ) : date}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
            {/* Rooms row */}
            <tr>
              <td>Salle</td>
              <td>
                <div>
                  {tableData.rooms.map((room, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'rooms', i)}
                      onDragOver={(e) => handleDragOver(e, 'rooms', i)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'rooms', i)}
                      onClick={() => handleEditStartFn('rooms', i)}
                    >
                      {editMode && currentField.section === 'rooms' && currentField.index === i ? (
                        <input
                          ref={inputRef}
                          value={room}
                          onChange={handleEditChange}
                          onBlur={handleEditFinish}
                        />
                      ) : room}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
            {/* Morning exams row */}
            <tr>
              <td>Examen Matin</td>
              <td>
                <div>
                  {tableData.morningExams.map((exam, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'morningExams', i)}
                      onDragOver={(e) => handleDragOver(e, 'morningExams', i)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'morningExams', i)}
                      onClick={() => handleEditStartFn('morningExams', i)}
                    >
                      {editMode && currentField.section === 'morningExams' && currentField.index === i ? (
                        <input
                          ref={inputRef}
                          value={exam}
                          onChange={handleEditChange}
                          onBlur={handleEditFinish}
                        />
                      ) : exam}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
            {/* Afternoon exams row */}
            <tr>
              <td>Examen Après-midi</td>
              <td>
                <div>
                  {tableData.afternoonExams.map((exam, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'afternoonExams', i)}
                      onDragOver={(e) => handleDragOver(e, 'afternoonExams', i)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'afternoonExams', i)}
                      onClick={() => handleEditStartFn('afternoonExams', i)}
                    >
                      {editMode && currentField.section === 'afternoonExams' && currentField.index === i ? (
                        <input
                          ref={inputRef}
                          value={exam}
                          onChange={handleEditChange}
                          onBlur={handleEditFinish}
                        />
                      ) : exam}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
            {/* Coordinator row */}
            <tr>
              <td>Coordinateur</td>
              <td onClick={() => handleEditStartFn('examDetails', null, 'coordinator')}>
                {editMode && currentField.section === 'examDetails' && currentField.key === 'coordinator' ? (
                  <input
                    ref={inputRef}
                    value={tableData.examDetails.coordinator}
                    onChange={handleEditChange}
                    onBlur={handleEditFinish}
                  />
                ) : tableData.examDetails.coordinator}
              </td>
            </tr>
            {/* Instructors row */}
            <tr>
              <td>Instructeurs</td>
              <td>
                <div>
                  {tableData.examDetails.instructors.map((instructor, i) => (
                    <div key={i}>
                      <span
                        onClick={() => handleEditStartFn('examDetails', i, 'instructors')}
                      >
                        {editMode && currentField.section === 'examDetails' && currentField.key === 'instructors' && currentField.index === i ? (
                          <input
                            ref={inputRef}
                            name="name"
                            value={instructor.name}
                            onChange={handleEditChange}
                            onBlur={handleEditFinish}
                          />
                        ) : instructor.name}
                      </span>
                      <span
                        onClick={() => handleEditStartFn('examDetails', i, 'instructors')}
                      >
                        {editMode && currentField.section === 'examDetails' && currentField.key === 'instructors' && currentField.index === i ? (
                          <input
                            ref={inputRef}
                            name="course"
                            value={instructor.course}
                            onChange={handleEditChange}
                            onBlur={handleEditFinish}
                          />
                        ) : instructor.course}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button onClick={exportAsImage}>
        Export Table Image
      </button>
    </div>
  );
};

export default ExamScheduleCreator;
