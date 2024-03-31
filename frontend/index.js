const itemTemplate = document.querySelector("#diary-item-template");
const todoList = document.querySelector("#todos");
const apiRoot = "http://localhost:8000/api";

async function main() {
  setupEventListeners();
  try {
    const todos = await getDiaries();
    //console.log("todos", todos)
    todos.forEach((todo) => renderDiary(todo));
    
  } catch (error) {
    //console.log(error.message);
    alert("Failed to load todos!");
  }
}

const tagColors = {
  學業: "#f1d33d",
  人際: "#FFCEA6",
  社團: "#FFCFD2",
  食物: "#F1C0E8",
  休閒: "#CFBAF0",
  旅遊: "#709c75",
  工作: "#76aef3",
  生活: "#fdf35d",
  其他: "#da84ff",
};


const moodColors = {
  快樂: "#A3C4F3",
  生氣: "#90DBF4",
  難過: "#8EECF5",
  疲憊: "#98F5E1",
  驚訝: "#B9FBC0",
  害怕: "#c6e092",
  無聊: "#a29af4",
  擔心: "#ef8eab",
  其他: "#87dac9",
};

const editingState = {
  editingDiary: null,
  editingDiaryId: null,
  isEditing: false
};
function isValidDate(dateStr) {
  const match = /^(\d{4})\.(\d{2})\.(\d{2}) \(([\u4e00-\u9fa5])\)$/.exec(dateStr);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // months are 0-based in JavaScript Date object
  const day = parseInt(match[3], 10);
  const inputDayOfWeek = match[4];

  const dateObj = new Date(year, month, day);

  const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
  const actualDayOfWeek = daysOfWeek[dateObj.getDay()];

  return dateObj.getFullYear() === year &&
         dateObj.getMonth() === month &&
         dateObj.getDate() === day &&
         actualDayOfWeek === inputDayOfWeek;
}

function setupEventListeners() {
  const addDiaryButton = document.querySelector("#diary-add");
  const saveDiaryButton = document.querySelector("#diary-save");
  const diaryFilterRecoverButton = document.querySelector("#filterRecover");
  const diaryFilterSaveButton = document.querySelector("#diary-save2");
  const diaryFilterButton = document.querySelector("#diary-filter");
  const diaryTagButtons = document.querySelectorAll(".tag-button");
  const diaryMoodButtons = document.querySelectorAll(".mood-button");
  const todoInput = document.querySelector("#diary-input");
  const todoContentInput = document.querySelector("#diary-content-input");
  const filterTagButtons = document.querySelectorAll(".tag-button2");
  const filterMoodButtons = document.querySelectorAll(".mood-button2");
  const modal = document.querySelector("#myModal");
  const closeModalButton = document.querySelector("#closeModal");
  const closeModalButton2 = document.querySelector("#closeModal2");
  const fileButton = document.getElementById('file-button')
  const fileButton2 = document.getElementById('file-button2')
  const filter = document.querySelector("#filter");
  let selectedTags = [];
  let tag ="";
  let mood ="";
 
  fileButton.addEventListener('click', (event)=>{
    event.preventDefault();
    fileButton2.click();
  });

  fileButton2.addEventListener('change', function() {
    const fileInput = fileButton2;
    const selectFileButton = fileButton;
   
    if (fileInput.files.length > 0) {
      selectFileButton.innerText = fileInput.files[0].name;
    } 
    else {
      
      selectFileButton.innerText = '選擇檔案';
    }
  });
 
  
  diaryFilterButton.addEventListener("click", () => {
    filter.style.display = "block";
  });

  filterTagButtons.forEach((button) => {
   
    button.addEventListener("click", () => {

      const computedStyle = window.getComputedStyle(button);
      const backgroundColor = computedStyle.backgroundColor;
      const tagValue = button.value;
     
      if (backgroundColor === "rgba(79, 109, 122, 0.682)") {
        button.style.backgroundColor = "#fff";
       
        const index = selectedTags.indexOf(tagValue);
        if (index !== -1) {
          selectedTags.splice(index, 1);
        }
      } 
      else {
        button.style.backgroundColor = "rgba(79, 109, 122, 0.682)";
        
        selectedTags.push(tagValue);
      }
    });
  
  });

  filterMoodButtons.forEach((button) => {
    
    button.addEventListener("click", () => {
      const computedStyle = window.getComputedStyle(button);
      const backgroundColor = computedStyle.backgroundColor;
      const tagValue = button.value;
      
      if (backgroundColor === "rgba(79, 109, 122, 0.682)") {
        
        button.style.backgroundColor = "#fff";
        const index = selectedTags.indexOf(tagValue);
        if (index !== -1) {
          selectedTags.splice(index, 1);
        }
      } 
      else {
       
        selectedTags.push(tagValue);
        button.style.backgroundColor = "rgba(79, 109, 122, 0.682)";
      }
    });
      

  });



  addDiaryButton.addEventListener("click", () => {
    
    modal.style.display = "block";

  });

  diaryTagButtons.forEach((button) => {
    button.addEventListener("click", () => {
     
      diaryTagButtons.forEach((btn) => {
        btn.style.backgroundColor = "#fff";
      });
      tag = button.value;
    
      button.style.backgroundColor = "#4f6d7aae";
    });
  });

  diaryMoodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      diaryMoodButtons.forEach((btn) => {
        btn.style.backgroundColor = "#fff";
      });
      mood = button.value;
      
      button.style.backgroundColor = "#4f6d7aae";
    });
  });

  diaryFilterRecoverButton.addEventListener("click", async () => {

    todoList.innerHTML = "";
    const todos = await getDiaries();
    todos.forEach((todo) => {
      renderDiary(todo);
    });
    filterTagButtons.forEach((btn) => {
      btn.style.backgroundColor = "#fff";
    });
    filterMoodButtons.forEach((btn) => {
      btn.style.backgroundColor = "#fff";
    });
    selectedTags = []
    filter.style.display = "none";
  });

  diaryFilterSaveButton.addEventListener("click", async () => {
    todoList.innerHTML = "";
    const todos = await getDiaries();
    todos.forEach((todo) => {
    
      if((selectedTags.length === 0 || selectedTags.includes(todo.tag)) || selectedTags.includes(todo.mood)){
        renderDiary(todo);
      }
     
    });
    
    filter.style.display = "none";
  });


  saveDiaryButton.addEventListener("click", async () => {
    let title = todoInput.value;
    const description = todoContentInput.value;
    const currentDate = new Date();
    let file = ""
    // //console.log("fileButton2.files.length: ", fileButton2.files.length)

    if (fileButton2.files.length > 0){
      const selectedFile = fileButton2.files[0];
      const reader = new FileReader();
      const readFileAsDataURL = () => {
        return new Promise((resolve) => {
          reader.onload = function(event) {
            const base64Data = event.target.result; 
            // //console.log('Base64:', base64Data);
            file = base64Data;
            // //console.log("save file: ", file);
            resolve();
          };
          reader.readAsDataURL(selectedFile);
        });
      };
      await readFileAsDataURL();
    }    
    //console.log("save file2: ", file);
  
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][currentDate.getDay()];
    // const dateRegex = /^\d{4}\.\d{2}\.\d{2} \([\u4e00-\u9fa5]\)$/; // 匹配 "年.月.日 (周几)"
    
    const formattedDate = `${year}.${month}.${day} (${dayOfWeek})`;
  

    if (editingState.isEditing) {
      //console.log("tag : ", tag)
      const diaryToEdit = editingState.editingDiary;
      const editingDiaryId = editingState.editingDiaryId;
      
      const editedTitle = todoInput.value;
      const editedDescription = todoContentInput.value;
      const editedTag = tag;
      const editedMood = mood;
      const editedFile = file;
      //console.log("diaryToEdit : ", diaryToEdit )
      //console.log("editedTitle: ", editedTitle, "editedDescription: ", editedDescription, "editedTag: ", editedTag, "editedMood: ", editedMood) 
      if (diaryToEdit) {
        
        if (editedTitle !== "") {
          if(isValidDate(title)){
            diaryToEdit.title = editedTitle;
          }
          else{
            alert("Please enter a valid date format (e.g., 2023.09.08 (五)).");
            return;
          }
        }
        if (editedDescription !== "") {
          diaryToEdit.description = editedDescription;
        }
        
        if (editedTag !== "") {
          diaryToEdit.tag = editedTag;
        }

        if (editedMood !== "") {
          diaryToEdit.mood = editedMood;
        }

        if (editedFile !== "") {
          diaryToEdit.file = editedFile;
        }
        
        //console.log("final diaryToEdit : ", diaryToEdit )

        try {
          
          await updateDiaryStatus(editingDiaryId, diaryToEdit);
          window.location.reload(); 
        } catch (error) {
          //console.log("Error Message: ", error.message);
          alert("Failed to save diary!");
        }
      }
    } 
    else {
      if (!title) {
        title = formattedDate
      }
      else {
        //console.log("@@");
        
        if (!isValidDate(title)) {
          alert("Please enter a valid date format (e.g., 2023.09.08 (五)).");
          return;
        }
      }
      if (!description) {
        alert("Please enter a diary content!");
        return;
      }
      if (!tag) {
        alert("Please enter a tag!");
        return;
      }
      if (!mood) {
        alert("Please enter a mood!");
        return;
      }
  
      try {
        //console.log("file!! : ", file)
        
        const todo = await createDiary({ title, description, tag, mood, file});
        
        console.log("Response from createDiary: ", todo);
        
        renderDiary(todo);
      } 
      catch (error) {
        //console.log("Error Message: ", error.message);
        alert("Failed to create diary!");
        return;
      }
    }
    
    editingState.editingDiary = null;
    editingState.editingDiaryId = null;
    editingState.isEditing = false;
    fileButton2.value = ''; 
    todoInput.value = "";
    todoContentInput.value = "";
    fileButton.innerText = '選擇檔案'; 
    diaryTagButtons.forEach((button) => {
      button.style.backgroundColor = "#fff";
    });
    diaryMoodButtons.forEach((button) => {
      button.style.backgroundColor = "#fff";
    });
    mood = "";
    tag = "";
    modal.style.display = "none";
  });




  closeModalButton.addEventListener("click", () => {
    editingState.editingDiary = null;
    editingState.editingDiaryId = null;
    editingState.isEditing = false;
    fileButton2.value = ''; 
    todoInput.value = "";
    todoContentInput.value = "";
    fileButton.innerText = '選擇檔案'; 
    diaryTagButtons.forEach((button) => {
      button.style.backgroundColor = "#fff";
    });
    diaryMoodButtons.forEach((button) => {
      button.style.backgroundColor = "#fff";
    });
    mood = "";
    tag = "";
    modal.style.display = "none";
  });

  closeModalButton2.addEventListener("click", () => {
    filter.style.display = "none";
  });


}



function viewDiary(diary) {
  const modalTemplate = document.querySelector("#mode-view");
  
  
  
  const modalContent = modalTemplate.content.cloneNode(true);

 
  const modal = document.createElement("div");
  modal.className = "modal"; 

  modal.appendChild(modalContent);

 
  document.body.appendChild(modal);

  
  const closeModalButton = modal.querySelector("#closeModal2");

  
  closeModalButton.addEventListener("click", () => {
    modal.style.display = "none";
    document.body.removeChild(modal); 
  });

  const diaryTagButton = modal.querySelector(".diary-tag2");
  const diaryMoodButton = modal.querySelector(".diary-mood2");
  //console.log("viewDiary diary: ", diary);
  //console.log("diary.mood: ", diary.mood);
  diaryMoodButton.textContent = diary.mood;
  diaryTagButton.textContent = diary.tag;
  const diaryDateElement = modal.querySelector(".diary-title");
  const diaryContentElement = modal.querySelector(".diary-content2");
  diaryDateElement.textContent = diary.title; 
  diaryContentElement.textContent = diary.description; 
  const diaryImageElement = modal.querySelector(".diary-image2");

  diaryTagButton.style.backgroundColor = tagColors[diary.tag];
  diaryMoodButton.style.backgroundColor = moodColors[diary.mood];
  
  
  if (diary.file) {
    const img = document.createElement("img");
    
    //console.log("img b: ", img);
    img.alt = "Diary Image";
    //console.log("img a: ", img);
    
    img.onload = function() {
      const maxWidth = 212; 
      const maxHeight = 194; 
  
      const imgWidth = img.width; 
      const imgHeight = img.height; 
      //console.log("maxWidth, maxHeight", maxWidth, maxHeight)
      
      if (imgWidth > maxWidth || imgHeight > maxHeight) {
        if (imgWidth / maxWidth > imgHeight / maxHeight) {
          img.width = maxWidth;
          img.height = (maxWidth * imgHeight) / imgWidth;
        } else {
          img.height = maxHeight;
          img.width = (maxHeight * imgWidth) / imgHeight;
         
        }
      }
     
      //console.log("Image loaded successfully.");
      //console.log("img.src: ", img.src);
      diaryImageElement.appendChild(img);
    };
    img.src = `${diary.file}`; 
    
  } 
    

  
  const deleteButton = modal.querySelector("button.delete-todo");
  deleteButton.dataset._id = diary._id;
  deleteButton.addEventListener("click", () => {
    //console.log("delete diary: ", diary);
    deleteDiaryElement(diary._id);
    modal.style.display = "none";
    
  });

  const editDiaryButton = modal.querySelector("button.diary-edit");
  
  editDiaryButton.dataset._id = diary._id;
  editDiaryButton.addEventListener("click", () => {
    editDiary(diary);
    modal.style.display = "none";
    
  });
  modal.style.display = "block";
}


function editDiary(diary) {
  const diaryTagButtons = document.querySelectorAll(".tag-button");
  const diaryMoodButtons = document.querySelectorAll(".mood-button");
  const todoInput = document.querySelector("#diary-input");
  const todoContentInput = document.querySelector("#diary-content-input");
  const modal = document.querySelector("#myModal");
  const diaryImageInput = document.querySelector("#file-button2");
  
  todoInput.value = diary.title;
  todoContentInput.value = diary.description;
  diaryImageInput.files[0] = diary.file
  let tag = diary.tag
  let mood = diary.mood

  diaryTagButtons.forEach((button) => {
    if(button.value == tag){
      button.style.backgroundColor = "#4f6d7aae";
    }
    else {
      button.style.backgroundColor = "#fff";
    }
  });
  diaryMoodButtons.forEach((button) => {
    if(button.value == mood){
      button.style.backgroundColor = "#4f6d7aae";
    }
    else {
      button.style.backgroundColor = "#fff";
    }
  });
  diaryTagButtons.forEach((button) => {
    button.addEventListener("click", () => {
      diaryTagButtons.forEach((btn) => {
        btn.style.backgroundColor = "#fff";
      });
      tag = button.value;

      button.style.backgroundColor = "#4f6d7aae";
    });
  });
  diaryMoodButtons.forEach((button) => {
    button.addEventListener("click", () => {
    
      diaryMoodButtons.forEach((btn) => {
        btn.style.backgroundColor = "#fff";
      });
     
      mood = button.value;
      
      button.style.backgroundColor = "#4f6d7aae";
    });
  });
  modal.style.display = "block";
 
  editingState.editingDiary = diary;
  editingState.editingDiaryId = diary._id;
  
  editingState.isEditing = true;
  //console.log("##editingState.editingDiary: ", editingState.editingDiary)
  
}

function renderDiary(todo) {
  //console.log("todo: ", todo);
  const item = createDiaryElement(todo);
  //console.log("item: ", item);
  todoList.appendChild(item);
}


function createDiaryElement(todo) {
 
  const item = itemTemplate.content.cloneNode(true);
  const container = item.querySelector(".diary-item");
  container._id = todo._id;

  const title = item.querySelector("p.diary-title");
 
  title.innerText = todo.title;
 
  const description = item.querySelector("p.diary-content");
  description.innerText = todo.description;
  
  const tag = item.querySelector("button.diary-tag");
  tag.style.backgroundColor = tagColors[todo.tag];
  tag.innerText = todo.tag;
  
  const mood = item.querySelector("button.diary-mood");
  mood.style.backgroundColor = moodColors[todo.mood];
  mood.innerText = todo.mood;
  
  const diaryItems = item.querySelector(".diary-item");
  diaryItems.addEventListener("click", () => {
    viewDiary(todo);
  });

  return item;
}



async function deleteDiaryElement(id) {
  //console.log("deleteDiaryElement id: ", id);
  try {
    await deleteDiaryById(id);
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to delete todo!");
  } finally {
   
    const todos = await getDiaries();
    todoList.innerHTML = "";
    todos.forEach((todo) => renderDiary(todo));
  }
}

async function getDiaries() {
  // try {
    //console.log(`${apiRoot}/todos`);
    const response = await fetch(`${apiRoot}/todos`);
  
    const data = await response.json();
    return data;
  // } catch (error) {
  //   //console.log("Error fetching todos:", error.message);
   
  //   throw error;
  // }
}

async function createDiary(todo) {
  //console.log("createDiary todo: ", todo);

  
  const requestData = {
    title: todo.title,
    description: todo.description,
    tag: todo.tag,
    mood: todo.mood,
  };

  if (todo.file) {
    requestData.file = todo.file;
  }

  const response = await fetch(`${apiRoot}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
    },
    body: JSON.stringify(requestData), 
  });

  const data = await response.json();
  return data;
}

async function updateDiaryStatus(id, todo) {
  const requestData = {
    title: todo.title,
    description: todo.description,
    tag: todo.tag,
    mood: todo.mood,
    file: todo.file,
  };

  const response = await fetch(`${apiRoot}/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json", 
    },
    body: JSON.stringify(requestData), 
  });

  //console.log(")))");
  const data = await response.json();
  return data;
}


async function deleteDiaryById(id) {
  //console.log("deleteDiaryById id: ", id);
  const response = await fetch(`${apiRoot}/todos/${id}`, {
    method: "DELETE",
    
  });
  const data = await response.json();
  return data;
}

main();
