// 색상 배열
const subjectColors = ['subject-blue', 'subject-purple', 'subject-green', 'subject-pink', 'subject-mint'];
let colorIndex = 0;
let selectedCell = null;
// 페이지 로드 시 시간표 불러오기
document.addEventListener('DOMContentLoaded', function() {
    loadTimetable();
});
// localStorage에서 데이터 불러오기
function loadTimetable() {
    const data = JSON.parse(localStorage.getItem('timetable')) || [];
    data.forEach(item => {
        const cell = document.querySelector(`[data-day="${item.day}"][data-period="${item.period}"]`);
        if (cell) {
            if (item.type === 'subject') {
                cell.className = `subject-cell ${item.color}`;
                cell.innerHTML = `
                    <div class="subject-name">${item.name}</div>
                    <div class="subject-info">${item.professor} | ${item.classroom}</div>
                `;
                cell.onclick = function() { deleteItem(item.day, item.period); };
            } else if (item.type === 'todo') {
                cell.className = 'subject-cell todo-cell';
                cell.innerHTML = `
                    <div class="subject-name">${item.title}</div>
                    <div class="subject-info">${item.memo || ''}</div>
                `;
                cell.onclick = function() { deleteItem(item.day, item.period); };
            }
        }
    });
}
// localStorage에 데이터 저장
function saveTimetable(item) {
    const data = JSON.parse(localStorage.getItem('timetable')) || [];
    // 같은 시간에 이미 있는 항목 제거
    const filtered = data.filter(d => !(d.day === item.day && d.period === item.period));
    filtered.push(item);
    localStorage.setItem('timetable', JSON.stringify(filtered));
}
// 셀 선택
function selectCell(cell) {
    selectedCell = cell;
}
// 과목 추가 모달 열기
function openSubjectModal() {
    document.getElementById('subjectModal').classList.add('active');
}
// 과목 추가 모달 닫기
function closeSubjectModal() {
    document.getElementById('subjectModal').classList.remove('active');
    document.getElementById('subjectForm').reset();
    // 체크박스 모두 해제
    document.querySelectorAll('input[name="period"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}
// Todo 추가 모달 열기
function openTodoModal() {
    document.getElementById('todoModal').classList.add('active');
}
// Todo 추가 모달 닫기
function closeTodoModal() {
    document.getElementById('todoModal').classList.remove('active');
    document.getElementById('todoForm').reset();
    // 체크박스 모두 해제
    document.querySelectorAll('input[name="todoPeriod"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}
// 과목 추가 폼 제출
document.getElementById('subjectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('subjectName').value;
    const professor = document.getElementById('professorName').value;
    const classroom = document.getElementById('classroom').value;
    const day = document.getElementById('daySelect').value;
    // 선택된 모든 교시 가져오기
    const selectedPeriods = Array.from(document.querySelectorAll('input[name="period"]:checked'))
        .map(checkbox => checkbox.value);
    if (selectedPeriods.length === 0) {
        alert('최소 1개 이상의 교시를 선택해주세요.');
        return;
    }
    const color = subjectColors[colorIndex % subjectColors.length];
    colorIndex++;
    // 각 교시마다 저장
    selectedPeriods.forEach(period => {
        const item = {
            type: 'subject',
            name: name,
            professor: professor,
            classroom: classroom,
            day: day,
            period: period,
            color: color
        };
        saveTimetable(item);
        const cell = document.querySelector(`[data-day="${day}"][data-period="${period}"]`);
        if (cell) {
            cell.className = `subject-cell ${color}`;
            cell.innerHTML = `
                <div class="subject-name">${name}</div>
                <div class="subject-info">${professor} | ${classroom}</div>
            `;
            cell.onclick = function() { deleteItem(day, period); };
        }
    });
    
    closeSubjectModal();
});
// Todo 추가 폼 제출
document.getElementById('todoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('todoTitle').value;
    const memo = document.getElementById('todoMemo').value;
    const day = document.getElementById('todoDaySelect').value;
    // 선택된 모든 시간 가져오기
    const selectedPeriods = Array.from(document.querySelectorAll('input[name="todoPeriod"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedPeriods.length === 0) {
        alert('최소 1개 이상의 시간을 선택해주세요.');
        return;
    }
    
    // 각 시간마다 저장
    selectedPeriods.forEach(period => {
        const item = {
            type: 'todo',
            title: title,
            memo: memo,
            day: day,
            period: period
        };
        saveTimetable(item);
        
        const cell = document.querySelector(`[data-day="${day}"][data-period="${period}"]`);
        if (cell) {
            cell.className = 'subject-cell todo-cell';
            cell.innerHTML = `
                <div class="subject-name">${title}</div>
                <div class="subject-info">${memo || ''}</div>
            `;
            cell.onclick = function() { deleteItem(day, period); };
        }
    });
    
    closeTodoModal();
});
// 항목 삭제
function deleteItem(day, period) {
    if (confirm('이 항목을 삭제하시겠습니까?')) {
        const data = JSON.parse(localStorage.getItem('timetable')) || [];
        const filtered = data.filter(d => !(d.day === day && d.period === period));
        localStorage.setItem('timetable', JSON.stringify(filtered));
        
        const cell = document.querySelector(`[data-day="${day}"][data-period="${period}"]`);
        if (cell) {
            cell.className = 'empty-cell';
            cell.innerHTML = '';
            cell.onclick = function() { selectCell(this); };
        }
    }
}
// 모달 외부 클릭 시 닫기
window.addEventListener('click', function(e) {
    const subjectModal = document.getElementById('subjectModal');
    const todoModal = document.getElementById('todoModal');
    
    if (e.target === subjectModal) {
        closeSubjectModal();
    }
    if (e.target === todoModal) {
        closeTodoModal();
    }
});