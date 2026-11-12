const practicals = [
{
    id: "p1",
    label: "Practical 1 – Address Book",
    title: "Address Book using Shell Script",
    desc: "Create, view, insert, delete and modify address-book records.",
    files: [
        {
            name: "addressbook.sh",
            code: `#!/bin/bash
FILE="addressbook.txt"

createAddressBook() {
    if [ -e "$FILE" ]; then
        echo "Address book already exists."
    else
        touch "$FILE"
        echo "Address book created."
    fi
}

viewAddressBook() {
    if [ ! -s "$FILE" ]; then
        echo "Address book is empty or does not exist."
    else
        echo "----- Address Book -----"
        cat "$FILE"
    fi
}

insertRecord() {
    if [ ! -e "$FILE" ]; then
        echo "Please create the address book first."
        return
    fi

    echo "Enter record (LastName,FirstName,Email,Phone):"
    read -r record
    echo "$record" >> "$FILE"
    echo "Record inserted."
}

deleteRecord() {
    if [ ! -s "$FILE" ]; then
        echo "Address book is empty."
        return
    fi

    echo "Enter a search string (name or email):"
    read -r search
    grep -n -- "$search" "$FILE"

    echo "Enter line number to delete:"
    read -r line

    if [[ "$line" =~ ^[0-9]+$ ]] && [ "$line" -ge 1 ] && [ "$line" -le "$(wc -l < "$FILE")" ]; then
        sed -i "\${line}d" "$FILE"
        echo "Record deleted."
    else
        echo "Invalid line number."
    fi
}

modifyRecord() {
    if [ ! -s "$FILE" ]; then
        echo "Address book is empty."
        return
    fi

    echo "Enter a search string (name or email):"
    read -r search
    grep -n -- "$search" "$FILE"

    echo "Enter line number to modify:"
    read -r line

    if [[ "$line" =~ ^[0-9]+$ ]] && [ "$line" -ge 1 ] && [ "$line" -le "$(wc -l < "$FILE")" ]; then
        echo "Enter new record (LastName,FirstName,Email,Phone):"
        read -r newRecord
        sed -i "\${line}s/.*/$newRecord/" "$FILE"
        echo "Record modified."
    else
        echo "Invalid line number."
    fi
}

exitProgram() {
    echo "Exiting... Goodbye!"
    exit 0
}

while true; do
    echo "===== Address Book Menu ====="
    echo "1. Create Address Book"
    echo "2. View Address Book"
    echo "3. Insert a Record"
    echo "4. Delete a Record"
    echo "5. Modify a Record"
    echo "6. Exit"

    read -rp "Enter your choice: " choice

    case "$choice" in
        1) createAddressBook ;;
        2) viewAddressBook ;;
        3) insertRecord ;;
        4) deleteRecord ;;
        5) modifyRecord ;;
        6) exitProgram ;;
        *) echo "Invalid choice. Please select 1-6." ;;
    esac
done`
        }
    ]
},

{
    id: "p2",
    label: "Practical 2 – Process Management",
    title: "Parent and Child Process with Sorting",
    desc: "Uses fork() to create a child. The child sorts in ascending order and the parent sorts in descending order.",
    files: [
        {
            name: "process.c",
            code: `#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int main(void) {
    int a[20], n, i, j, temp;
    pid_t pid;

    printf("Enter number of elements: ");
    scanf("%d", &n);

    if (n < 1 || n > 20) {
        printf("Enter between 1 and 20 elements.\\n");
        return 1;
    }

    printf("Enter %d numbers:\\n", n);
    for (i = 0; i < n; i++)
        scanf("%d", &a[i]);

    pid = fork();

    if (pid < 0) {
        perror("fork");
        return 1;
    }

    if (pid == 0) {
        printf("\\nChild Process\\n");
        printf("Child PID = %d, Parent PID = %d\\n",
               getpid(), getppid());

        for (i = 0; i < n - 1; i++) {
            for (j = 0; j < n - i - 1; j++) {
                if (a[j] > a[j + 1]) {
                    temp = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = temp;
                }
            }
        }

        printf("Child performed ascending sort: ");
        for (i = 0; i < n; i++)
            printf("%d ", a[i]);

        printf("\\n");
        exit(0);

    } else {
        wait(NULL);

        printf("\\nParent Process\\n");
        printf("Parent PID = %d\\n", getpid());

        for (i = 0; i < n - 1; i++) {
            for (j = 0; j < n - i - 1; j++) {
                if (a[j] < a[j + 1]) {
                    temp = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = temp;
                }
            }
        }

        printf("Parent performed descending sort: ");
        for (i = 0; i < n; i++)
            printf("%d ", a[i]);

        printf("\\n");
    }

    return 0;
}`
        }
    ]
},
    {
    id: "p3",
    label: "Practical 3 – Producer Consumer",
    title: "Thread Synchronization – Producer Consumer",
    desc: "Uses a bounded buffer, two semaphores and a mutex to synchronize producer and consumer threads.",
    files: [
        {
            name: "producer_consumer.c",
            code: `#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

#define SIZE 5

int buffer[SIZE], in = 0, out = 0;
sem_t empty, full;
pthread_mutex_t mutex;

void *producer(void *arg) {
    for (int item = 1; item <= 10; item++) {
        sem_wait(&empty);
        pthread_mutex_lock(&mutex);

        buffer[in] = item;
        printf("Produced: %d\\n", item);
        in = (in + 1) % SIZE;

        pthread_mutex_unlock(&mutex);
        sem_post(&full);
        sleep(1);
    }
    return NULL;
}

void *consumer(void *arg) {
    for (int i = 1; i <= 10; i++) {
        sem_wait(&full);
        pthread_mutex_lock(&mutex);

        int item = buffer[out];
        printf("Consumed: %d\\n", item);
        out = (out + 1) % SIZE;

        pthread_mutex_unlock(&mutex);
        sem_post(&empty);
        sleep(2);
    }
    return NULL;
}

int main(void) {
    pthread_t producer_thread, consumer_thread;

    sem_init(&empty, 0, SIZE);
    sem_init(&full, 0, 0);
    pthread_mutex_init(&mutex, NULL);

    pthread_create(&producer_thread, NULL, producer, NULL);
    pthread_create(&consumer_thread, NULL, consumer, NULL);

    pthread_join(producer_thread, NULL);
    pthread_join(consumer_thread, NULL);

    sem_destroy(&empty);
    sem_destroy(&full);
    pthread_mutex_destroy(&mutex);

    return 0;
}`
        }
    ]
},

{
    id: "p3b",
    label: "Practical 3 (Additional) – Reader Writer",
    title: "Reader-Writer Problem",
    desc: "Allows concurrent readers while ensuring a writer has exclusive access to the shared resource.",
    files: [
        {
            name: "reader_writer.c",
            code: `#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>

pthread_mutex_t x, wsem;
int readcount = 0;

void initialize(void) {
    pthread_mutex_init(&x, NULL);
    pthread_mutex_init(&wsem, NULL);
    readcount = 0;
}

void *reader(void *param) {
    int waittime = rand() % 5;

    pthread_mutex_lock(&x);
    readcount++;

    if (readcount == 1)
        pthread_mutex_lock(&wsem);

    printf("\\n%d reader(s) inside", readcount);
    pthread_mutex_unlock(&x);

    sleep(waittime);

    pthread_mutex_lock(&x);
    readcount--;

    if (readcount == 0)
        pthread_mutex_unlock(&wsem);

    pthread_mutex_unlock(&x);
    printf("\\nReader is leaving");

    return NULL;
}

void *writer(void *param) {
    int waittime = rand() % 3;

    printf("\\nWriter is trying to enter");
    pthread_mutex_lock(&wsem);

    printf("\\nWriter has entered");
    sleep(waittime);

    pthread_mutex_unlock(&wsem);
    printf("\\nWriter is leaving");

    return NULL;
}

int main(void) {
    int n1, n2, i;
    pthread_t tid[100];

    initialize();

    printf("Enter the number of readers: ");
    scanf("%d", &n1);

    printf("Enter number of writers: ");
    scanf("%d", &n2);

    if (n1 < 0 || n2 < 0 || n1 + n2 > 100) {
        printf("Enter valid thread counts (maximum 100).\\n");
        return 1;
    }

    for (i = 0; i < n1; i++)
        pthread_create(&tid[i], NULL, reader, NULL);

    for (i = 0; i < n2; i++)
        pthread_create(&tid[n1 + i], NULL, writer, NULL);

    for (i = 0; i < n1 + n2; i++)
        pthread_join(tid[i], NULL);

    pthread_mutex_destroy(&x);
    pthread_mutex_destroy(&wsem);

    return 0;
}`
        }
    ]
},

{
    id: "p4",
    label: "Practical 4 – Dining Philosophers",
    title: "Dining Philosophers Problem",
    desc: "Five philosopher threads compete for five chopsticks represented by semaphores.",
    files: [
        {
            name: "dining_philosophers.c",
            code: `#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

#define N 5

sem_t chopstick[N];
sem_t room;

void *philosopher(void *arg) {
    int id = *(int *)arg;

    printf("Philosopher %d is thinking\\n", id);
    sleep(1);

    sem_wait(&room);

    sem_wait(&chopstick[id]);
    sem_wait(&chopstick[(id + 1) % N]);

    printf("Philosopher %d is eating\\n", id);
    sleep(2);

    sem_post(&chopstick[id]);
    sem_post(&chopstick[(id + 1) % N]);

    sem_post(&room);

    printf("Philosopher %d finished eating\\n", id);
    return NULL;
}

int main(void) {
    pthread_t thread[N];
    int id[N];

    sem_init(&room, 0, N - 1);

    for (int i = 0; i < N; i++)
        sem_init(&chopstick[i], 0, 1);

    for (int i = 0; i < N; i++) {
        id[i] = i;
        pthread_create(&thread[i], NULL, philosopher, &id[i]);
    }

    for (int i = 0; i < N; i++)
        pthread_join(thread[i], NULL);

    for (int i = 0; i < N; i++)
        sem_destroy(&chopstick[i]);

    sem_destroy(&room);

    return 0;
}`
        }
    ]
},

{
    id: "p5",
    label: "Practical 5 – Banker's Algorithm",
    title: "Deadlock Avoidance using Banker's Algorithm",
    desc: "Calculates the Need matrix and checks whether the system is in a safe state.",
    files: [
        {
            name: "bankers.c",
            code: `#include <stdio.h>

int main(void) {
    int n, m;
    int allocation[10][10], max[10][10], need[10][10];
    int available[10], work[10], finish[10] = {0};
    int safeSequence[10];

    int i, j, count = 0;

    printf("Enter number of processes: ");
    scanf("%d", &n);

    printf("Enter number of resources: ");
    scanf("%d", &m);

    if (n < 1 || n > 10 || m < 1 || m > 10) {
        printf("Invalid number of processes or resources.\\n");
        return 1;
    }

    printf("Enter Allocation Matrix:\\n");
    for (i = 0; i < n; i++)
        for (j = 0; j < m; j++)
            scanf("%d", &allocation[i][j]);

    printf("Enter Maximum Matrix:\\n");
    for (i = 0; i < n; i++)
        for (j = 0; j < m; j++)
            scanf("%d", &max[i][j]);

    printf("Enter Available Resources:\\n");
    for (j = 0; j < m; j++)
        scanf("%d", &available[j]);

    for (i = 0; i < n; i++) {
        for (j = 0; j < m; j++) {
            need[i][j] = max[i][j] - allocation[i][j];

            if (need[i][j] < 0) {
                printf("Invalid allocation or maximum matrix.\\n");
                return 1;
            }
        }
    }

    for (j = 0; j < m; j++)
        work[j] = available[j];

    while (count < n) {
        int found = 0;

        for (i = 0; i < n; i++) {
            if (finish[i] == 0) {
                int canExecute = 1;

                for (j = 0; j < m; j++) {
                    if (need[i][j] > work[j]) {
                        canExecute = 0;
                        break;
                    }
                }

                if (canExecute) {
                    for (j = 0; j < m; j++)
                        work[j] += allocation[i][j];

                    safeSequence[count++] = i;
                    finish[i] = 1;
                    found = 1;
                }
            }
        }

        if (!found)
            break;
    }

    if (count == n) {
        printf("\\nSystem is in a SAFE STATE.\\n");
        printf("Safe Sequence: ");

        for (i = 0; i < n; i++)
            printf("P%d%s", safeSequence[i],
                   i == n - 1 ? "\\n" : " -> ");
    } else {
        printf("\\nSystem is in an UNSAFE STATE.\\n");
    }

    return 0;
}`
        }
    ]
},

    {
    id: "p6",
    label: "Practical 6 – IPC using FIFO",
    title: "Client-Server Communication using Named FIFO",
    desc: "Two named FIFOs are used to send a message from client to server and return the server response.",
    files: [
        {
            name: "server.c",
            code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main(void) {
    const char *to_server = "fifo6.txt";
    const char *to_client = "fifo7.txt";

    char message[5000], buffer[5000];
    int fd, fd2;

    if (mkfifo(to_server, 0666) == -1 &&
        access(to_server, F_OK) == -1) {
        perror("mkfifo fifo6");
        return 1;
    }

    if (mkfifo(to_client, 0666) == -1 &&
        access(to_client, F_OK) == -1) {
        perror("mkfifo fifo7");
        return 1;
    }

    puts("Server waiting for client...");

    fd = open(to_server, O_RDONLY);
    if (fd == -1) {
        perror("open fifo6");
        return 1;
    }

    fd2 = open(to_client, O_WRONLY);
    if (fd2 == -1) {
        perror("open fifo7");
        close(fd);
        return 1;
    }

    ssize_t len = read(fd, message, sizeof(message) - 1);

    if (len > 0) {
        message[len] = '\\0';

        printf("Server received: %s\\n", message);

        snprintf(buffer, sizeof(buffer),
                 "Server received: %s", message);

        write(fd2, buffer, strlen(buffer));
    }

    close(fd);
    close(fd2);

    unlink(to_server);
    unlink(to_client);

    return 0;
}`
        },
        {
            name: "client.c",
            code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>

int main(void) {
    int fd, fd2;
    char message[5000], response[5000];

    puts("Client started.");

    fd = open("fifo6.txt", O_WRONLY);
    if (fd == -1) {
        perror("open fifo6");
        return 1;
    }

    printf("Enter message: ");

    if (fgets(message, sizeof(message), stdin) != NULL) {
        if (write(fd, message, strlen(message)) == -1) {
            perror("write");
            close(fd);
            return 1;
        }
    }

    close(fd);

    fd2 = open("fifo7.txt", O_RDONLY);
    if (fd2 == -1) {
        perror("open fifo7");
        return 1;
    }

    ssize_t len = read(fd2, response, sizeof(response) - 1);

    if (len > 0) {
        response[len] = '\\0';
        printf("%s\\n", response);
    }

    close(fd2);

    return 0;
}`
        }
    ]
},

{
    id: "p7",
    label: "Practical 7 – IPC using Pipe",
    title: "Parent-Child Communication using Unnamed Pipes",
    desc: "The parent sends a file path to the child through one pipe. The child reads the file and sends its contents back through another pipe.",
    files: [
        {
            name: "pipe.c",
            code: `#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>
#include <string.h>

int main(void) {
    int pipe1[2], pipe2[2];
    pid_t pid;

    char pathname[100], buffer[1024];
    ssize_t n;

    if (pipe(pipe1) == -1 || pipe(pipe2) == -1) {
        perror("pipe");
        exit(1);
    }

    pid = fork();

    if (pid < 0) {
        perror("fork");
        exit(1);
    }

    if (pid > 0) {
        close(pipe1[0]);
        close(pipe2[1]);

        printf("Enter the pathname of the file: ");
        scanf("%99s", pathname);

        write(pipe1[1], pathname, strlen(pathname) + 1);
        close(pipe1[1]);

        printf("\\nContents of the file:\\n");

        while ((n = read(pipe2[0], buffer, sizeof(buffer))) > 0) {
            write(STDOUT_FILENO, buffer, n);
        }

        close(pipe2[0]);
        wait(NULL);

    } else {
        FILE *fp;

        close(pipe1[1]);
        close(pipe2[0]);

        read(pipe1[0], pathname, sizeof(pathname));
        close(pipe1[0]);

        fp = fopen(pathname, "r");

        if (fp == NULL) {
            const char *msg = "Error: File cannot be opened.\\n";

            write(pipe2[1], msg, strlen(msg));
            close(pipe2[1]);
            exit(1);
        }

        while (fgets(buffer, sizeof(buffer), fp) != NULL) {
            write(pipe2[1], buffer, strlen(buffer));
        }

        fclose(fp);
        close(pipe2[1]);

        exit(0);
    }

    return 0;
}`
        }
    ]
},

{
    id: "p8",
    label: "Practical 8 – Disk Scheduling",
    title: "Disk Scheduling Algorithms",
    desc: "Three separate programs from your practical: SSTF, SCAN and C-LOOK.",
    files: [
        {
            name: "sstf.c",
            code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int rq[100], visited[100] = {0};
    int n, initial, total = 0;

    printf("Enter number of requests: ");
    scanf("%d", &n);

    if (n < 1 || n > 100) {
        printf("Invalid number of requests.\\n");
        return 1;
    }

    printf("Enter request sequence:\\n");
    for (int i = 0; i < n; i++)
        scanf("%d", &rq[i]);

    printf("Enter initial head position: ");
    scanf("%d", &initial);

    for (int count = 0; count < n; count++) {
        int min = 100000, index = -1;

        for (int i = 0; i < n; i++) {
            int d = abs(rq[i] - initial);

            if (!visited[i] && d < min) {
                min = d;
                index = i;
            }
        }

        visited[index] = 1;
        total += min;
        initial = rq[index];
    }

    printf("Total head movement is %d\\n", total);

    return 0;
}`
        },
        {
            name: "scan.c",
            code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int rq[100], n, initial, size, move;
    int total = 0, index = 0;
    int i, j, temp;

    printf("Enter number of requests: ");
    scanf("%d", &n);

    if (n < 1 || n > 100) {
        printf("Invalid number of requests.\\n");
        return 1;
    }

    printf("Enter request sequence:\\n");
    for (i = 0; i < n; i++)
        scanf("%d", &rq[i]);

    printf("Enter initial head position: ");
    scanf("%d", &initial);

    printf("Enter total disk size: ");
    scanf("%d", &size);

    printf("Enter direction (1 = high, 0 = low): ");
    scanf("%d", &move);

    if (size <= 0 || initial < 0 || initial >= size ||
        (move != 0 && move != 1)) {
        printf("Invalid disk parameters.\\n");
        return 1;
    }

    for (i = 0; i < n - 1; i++) {
        for (j = 0; j < n - i - 1; j++) {
            if (rq[j] > rq[j + 1]) {
                temp = rq[j];
                rq[j] = rq[j + 1];
                rq[j + 1] = temp;
            }
        }
    }

    while (index < n && rq[index] < initial)
        index++;

    if (move == 1) {
        for (i = index; i < n; i++) {
            total += abs(rq[i] - initial);
            initial = rq[i];
        }

        total += abs((size - 1) - initial);
        initial = size - 1;

        for (i = index - 1; i >= 0; i--) {
            total += abs(rq[i] - initial);
            initial = rq[i];
        }

    } else {
        for (i = index - 1; i >= 0; i--) {
            total += abs(rq[i] - initial);
            initial = rq[i];
        }

        total += initial;
        initial = 0;

        for (i = index; i < n; i++) {
            total += abs(rq[i] - initial);
            initial = rq[i];
        }
    }

    printf("Total head movement is %d\\n", total);

    return 0;
}`
        },
        {
            name: "c_look.c",
            code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int rq[100], n, initial, move;
    int total = 0, index = 0;
    int i, j, temp;

    printf("Enter number of requests: ");
    scanf("%d", &n);

    if (n < 1 || n > 100) {
        printf("Invalid number of requests.\\n");
        return 1;
    }

    printf("Enter request sequence:\\n");
    for (i = 0; i < n; i++)
        scanf("%d", &rq[i]);

    printf("Enter initial head position: ");
    scanf("%d", &initial);

    printf("Enter direction (1 = high, 0 = low): ");
    scanf("%d", &move);

    if (initial < 0 || (move != 0 && move != 1)) {
        printf("Invalid input.\\n");
        return 1;
    }

    for (i = 0; i < n - 1; i++) {
        for (j = 0; j < n - i - 1; j++) {
            if (rq[j] > rq[j + 1]) {
                temp = rq[j];
                rq[j] = rq[j + 1];
                rq[j + 1] = temp;
            }
        }
    }

    while (index < n && rq[index] < initial)
        index++;

    if (move == 1) {
        for (i = index; i < n; i++) {
            total += abs(rq[i] - initial);
            initial = rq[i];
        }

        if (index > 0) {
            total += abs(initial - rq[0]);
            initial = rq[0];

            for (i = 1; i < index; i++) {
                total += abs(rq[i] - initial);
                initial = rq[i];
            }
        }

    } else {
        for (i = index - 1; i >= 0; i--) {
            total += abs(rq[i] - initial);
            initial = rq[i];
        }

        if (index < n) {
            total += abs(initial - rq[n - 1]);
            initial = rq[n - 1];

            for (i = n - 2; i >= index; i--) {
                total += abs(rq[i] - initial);
                initial = rq[i];
            }
        }
    }

    printf("Total head movement is %d\\n", total);

    return 0;
}`
        }
    ]
},
    const vivaNotes = {

    p1: {
        heading: "Viva Notes – Address Book using Shell Script",
        concepts: [
            ["Shell", "A command interpreter that lets users interact with the operating system."],
            ["Shell script", "A file containing a sequence of shell commands executed by the shell."],
            ["Address book", "A text file used to store and manage contact details."],
            ["touch", "Creates an empty file if it does not already exist."],
            ["cat", "Displays the contents of a file."],
            ["grep", "Searches for matching text in a file."],
            ["sed", "Can edit, replace or delete text in a file."],
            ["case statement", "Selects an action based on the user's menu choice."]
        ],
        viva: [
            ["What is a shell script?", "A program containing shell commands that are executed by a shell."],
            ["What is the purpose of the shebang line?", "It specifies which interpreter should execute the script, for example #!/bin/bash."],
            ["What does read do?", "It accepts input from the user."],
            ["What is the use of grep?", "It searches for a word or pattern in a file."],
            ["What does -e test?", "It checks whether a file or path exists."],
            ["How do you run this script?", "Save it as addressbook.sh, run chmod +x addressbook.sh, then ./addressbook.sh."]
        ]
    },

    p2: {
        heading: "Viva Notes – Process Creation using fork()",
        concepts: [
            ["Process", "A program that is currently executing."],
            ["fork()", "A system call that creates a new process by duplicating the calling process."],
            ["Parent process", "The process that calls fork() and creates another process."],
            ["Child process", "The new process created by fork()."],
            ["PID", "Process ID; a unique number used by the operating system to identify a process."],
            ["getpid()", "Returns the process ID of the calling process."],
            ["getppid()", "Returns the parent process ID."],
            ["wait()", "Makes the parent wait until a child process terminates."]
        ],
        viva: [
            ["What does fork() return?", "It returns 0 to the child, the child's PID to the parent, and -1 if creation fails."],
            ["Why is wait() used?", "To make the parent wait for the child and help prevent a zombie process."],
            ["Do parent and child have the same PID?", "No. Each process has a different PID."],
            ["What is a zombie process?", "A child process that has terminated but whose exit status has not yet been collected by its parent."],
            ["What is the difference between a process and a program?", "A program is a passive file; a process is a program in execution."],
            ["Which sorting is done by the child and parent in this program?", "The child sorts in ascending order and the parent sorts in descending order."]
        ]
    },

    p3: {
        heading: "Viva Notes – Producer-Consumer Problem",
        concepts: [
            ["Producer", "A thread or process that creates data and places it in a shared buffer."],
            ["Consumer", "A thread or process that removes and uses data from the buffer."],
            ["Critical section", "A part of a program that accesses shared data and must be protected."],
            ["Race condition", "An error that can occur when multiple threads access shared data without proper synchronization."],
            ["Semaphore", "A synchronization variable used to control access to shared resources."],
            ["Mutex", "A lock that allows only one thread at a time to enter a protected critical section."],
            ["empty semaphore", "Counts the available empty slots in the buffer."],
            ["full semaphore", "Counts the filled slots in the buffer."]
        ],
        viva: [
            ["What is the Producer-Consumer problem?", "A synchronization problem in which producers add items to a bounded buffer and consumers remove them."],
            ["Why is a semaphore used?", "To coordinate threads and avoid buffer overflow or underflow."],
            ["What is the initial value of empty?", "The buffer size, because all slots are initially empty."],
            ["What is the initial value of full?", "Zero, because the buffer initially contains no items."],
            ["Why is a mutex required?", "To protect shared buffer variables from simultaneous access."],
            ["What is a bounded buffer?", "A buffer with a fixed maximum capacity."]
        ]
    },

    p3b: {
        heading: "Viva Notes – Reader-Writer Problem",
        concepts: [
            ["Reader", "A thread that reads shared data without changing it."],
            ["Writer", "A thread that modifies shared data."],
            ["Read count", "The number of readers currently accessing the shared resource."],
            ["Reader preference", "A solution that permits multiple readers together but can make writers wait."],
            ["Exclusive access", "Only one writer can use the shared resource at a time."]
        ],
        viva: [
            ["What is the Reader-Writer problem?", "A synchronization problem involving readers and writers accessing the same shared data."],
            ["Can multiple readers read at the same time?", "Yes, when no writer is modifying the shared resource."],
            ["Can a reader and writer access the data simultaneously?", "No, not when the writer needs exclusive access."],
            ["Why is readcount protected by a mutex?", "To prevent race conditions while updating the reader count."],
            ["What is writer starvation?", "A situation where a writer waits indefinitely because readers keep arriving."]
        ]
    },

    p4: {
        heading: "Viva Notes – Dining Philosophers Problem",
        concepts: [
            ["Dining Philosophers", "A classic synchronization problem used to explain resource sharing and deadlock."],
            ["Semaphore", "Controls access to each chopstick in this program."],
            ["Deadlock", "A condition in which processes wait forever for resources held by one another."],
            ["Starvation", "A process waits for a very long time because it repeatedly fails to get the required resource."],
            ["Mutual exclusion", "Only one philosopher can hold a particular chopstick at a time."]
        ],
        viva: [
            ["What does each philosopher represent?", "A concurrent process or thread."],
            ["What do chopsticks represent?", "Shared resources that require mutual exclusion."],
            ["What is deadlock?", "A situation where processes wait indefinitely for resources."],
            ["How many philosophers and chopsticks are used?", "Five philosophers and five chopsticks."],
            ["Why are semaphores used?", "To ensure that a chopstick is held by only one philosopher at a time."],
            ["How can deadlock be avoided?", "For example, allow at most four philosophers to try to pick up chopsticks simultaneously, or impose a resource ordering."]
        ]
    },

    p5: {
        heading: "Viva Notes – Banker's Algorithm",
        concepts: [
            ["Deadlock", "A condition where processes wait indefinitely for resources held by one another."],
            ["Banker's Algorithm", "A deadlock-avoidance algorithm that grants resources only when the resulting state is safe."],
            ["Allocation matrix", "Shows the resources currently allocated to each process."],
            ["Maximum matrix", "Shows the maximum resources each process may require."],
            ["Need matrix", "Shows the remaining resources required by each process: Need = Maximum − Allocation."],
            ["Available", "The number of currently available instances of each resource."],
            ["Safe state", "A state in which at least one safe sequence exists for all processes."],
            ["Work and Finish", "Work tracks resources available during checking; Finish records completed processes."]
        ],
        viva: [
            ["What is the purpose of Banker's Algorithm?", "To avoid deadlock by checking whether granting resources keeps the system in a safe state."],
            ["What is the Need formula?", "Need[i][j] = Max[i][j] − Allocation[i][j]."],
            ["What is a safe sequence?", "An order in which every process can finish with the available resources plus resources released by earlier processes."],
            ["What is an unsafe state?", "A state in which the algorithm cannot find a safe sequence; it does not necessarily mean deadlock has already occurred."],
            ["Why is it called Banker's Algorithm?", "It is compared to a banker who grants loans only when enough resources remain to satisfy customers safely."],
            ["What does Finish[i] = 1 mean?", "Process i has completed in the safety check."]
        ]
    },

    p6: {
        heading: "Viva Notes – Inter-Process Communication using FIFO",
        concepts: [
            ["IPC", "Inter-Process Communication allows processes to exchange data."],
            ["FIFO", "A named pipe used for communication between processes, including unrelated processes."],
            ["mkfifo()", "Creates a named pipe in the file system."],
            ["open()", "Opens a FIFO for reading or writing."],
            ["read()", "Reads data from a file descriptor."],
            ["write()", "Writes data to a file descriptor."],
            ["File descriptor", "A small integer used by a process to identify an open file or communication channel."]
        ],
        viva: [
            ["What is FIFO?", "First In First Out; a named pipe in which data is read in the order it is written."],
            ["What is the use of mkfifo()?", "It creates a named pipe."],
            ["What is the difference between pipe and FIFO?", "An ordinary pipe is generally used between related processes; a FIFO has a name in the file system and can be used by unrelated processes."],
            ["Why are two FIFOs used in this program?", "One carries client-to-server data and the other carries server-to-client data."],
            ["What happens when a FIFO is opened for reading?", "The open may wait until another process opens the FIFO for writing."],
            ["How is a FIFO removed?", "Using unlink() after communication is complete."]
        ]
    },

    p7: {
        heading: "Viva Notes – IPC using Unnamed Pipes",
        concepts: [
            ["Pipe", "A unidirectional communication channel used to transfer data between processes."],
            ["pipe()", "Creates a pipe and returns two file descriptors."],
            ["fork()", "Creates a child process."],
            ["pipefd[0]", "The read end of a pipe."],
            ["pipefd[1]", "The write end of a pipe."],
            ["Parent process", "In this program, it sends the file path and receives file contents."],
            ["Child process", "It receives the path, opens the file and sends its contents back."],
            ["fopen()", "Opens a file using a stream."]
        ],
        viva: [
            ["What is an unnamed pipe?", "A temporary IPC channel that usually connects related processes."],
            ["What does pipe(fd) create?", "A pipe with fd[0] as the read end and fd[1] as the write end."],
            ["Why are two pipes used?", "Because each pipe is unidirectional; one sends the file path and the other returns file contents."],
            ["Why should unused pipe ends be closed?", "To avoid resource leaks and ensure readers can detect the end of data."],
            ["What does read() return at end of file?", "Zero."],
            ["Why is wait(NULL) used?", "So the parent waits for the child process to finish."]
        ]
    },

    p8: {
        heading: "Viva Notes – Disk Scheduling Algorithms",
        concepts: [
            ["Disk scheduling", "The method used by the operating system to decide the order of disk I/O requests."],
            ["Seek time", "Time taken by the disk head to move to the required track."],
            ["Head movement", "The distance travelled by the disk head, usually measured in cylinders."],
            ["SSTF", "Shortest Seek Time First selects the pending request closest to the current head position."],
            ["SCAN", "The disk head moves in one direction servicing requests, reaches the disk end, then reverses."],
            ["C-LOOK", "The head services requests in one direction up to the last request, then jumps to the first request on the other side."],
            ["Total head movement", "The sum of absolute differences between consecutive head positions."]
        ],
        viva: [
            ["What is disk scheduling?", "It decides the order in which pending disk requests are serviced."],
            ["What is SSTF?", "It selects the request nearest to the current head position."],
            ["What is the disadvantage of SSTF?", "A request far from the current head may suffer starvation."],
            ["What is SCAN also called?", "The elevator algorithm."],
            ["What is the difference between SCAN and C-LOOK?", "SCAN travels to the physical disk end before reversing; C-LOOK turns around at the last pending request and jumps to the first pending request on the other side."],
            ["How is total head movement calculated?", "Add the absolute movement between each consecutive head position."],
            ["What is the initial head position?", "The current cylinder where the disk head is located before servicing requests."]
        ]
    }

};

// ==========================================
// WEBSITE ELEMENTS
// ==========================================

const nav = document.getElementById("nav");
const content = document.getElementById("content");
const search = document.getElementById("search");

// ==========================================
// SEARCH AND NAVIGATION
// ==========================================

function renderNav(filter = "") {
    nav.innerHTML = "";

    const matches = practicals.filter(p =>
        (p.label + " " + p.title)
            .toLowerCase()
            .includes(filter.toLowerCase())
    );

    matches.forEach(p => {
        const button = document.createElement("button");

        button.textContent = p.label;
        button.dataset.id = p.id;

        button.addEventListener("click", () => {
            showPractical(p.id);
        });

        nav.appendChild(button);
    });

    if (!matches.length) {
        nav.innerHTML = '<div class="empty">No practical found.</div>';
    }
}

// ==========================================
// COPY TEXT FUNCTION
// ==========================================

async function copyText(text, button, originalText) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        const area = document.createElement("textarea");

        area.value = text;
        document.body.appendChild(area);

        area.select();
        document.execCommand("copy");

        area.remove();
    }

    button.textContent = "Copied!";

    setTimeout(() => {
        button.textContent = originalText;
    }, 1400);
}

// ==========================================
// CREATE PLAIN TEXT VIVA NOTES
// ==========================================

function getVivaText(notes) {
    let text = notes.heading + "\n\n";

    text += "IMPORTANT CONCEPTS\n";

    notes.concepts.forEach(([term, explanation]) => {
        text += term + ": " + explanation + "\n";
    });

    text += "\nVIVA QUESTIONS WITH ANSWERS\n";

    notes.viva.forEach(([question, answer], index) => {
        text += "\nQ" + (index + 1) + ". " + question;
        text += "\nAns. " + answer + "\n";
    });

    return text;
}

// ==========================================
// DISPLAY SELECTED PRACTICAL
// ==========================================

function showPractical(id) {
    const p = practicals.find(x => x.id === id);

    if (!p) return;

    document.querySelectorAll(".nav button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.id === id
        );
    });

    content.innerHTML = `
        <div class="eyebrow">
            Practical code + viva preparation
        </div>

        <h2>${p.title}</h2>

        <p class="desc">${p.desc}</p>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">

            <button class="copy" id="printPage" type="button">
                Print / Save as PDF
            </button>

            <button class="copy" id="copyAll" type="button">
                Copy this practical's notes
            </button>

        </div>
    `;

    // PRINT BUTTON

    document.getElementById("printPage")
        .addEventListener("click", () => {
            window.print();
        });

    // DISPLAY PROGRAM CODE

    p.files.forEach(file => {
        const box = document.createElement("div");
        box.className = "file";

        const head = document.createElement("div");
        head.className = "filehead";

        const name = document.createElement("strong");
        name.textContent = file.name;

        const button = document.createElement("button");
        button.className = "copy";
        button.textContent = "Copy code";

        button.addEventListener("click", () => {
            copyText(file.code, button, "Copy code");
        });

        head.append(name, button);

        const pre = document.createElement("pre");
        const code = document.createElement("code");

        code.textContent = file.code;

        pre.appendChild(code);

        box.append(head, pre);
        content.appendChild(box);
    });

    // DISPLAY VIVA NOTES

    const notes = vivaNotes[id];

    if (notes) {
        const section = document.createElement("section");

        section.style.cssText =
            "margin-top:22px;border-top:2px solid #e6e8f0;padding-top:18px";

        const heading = document.createElement("h2");

        heading.textContent = notes.heading;
        heading.style.fontSize = "21px";

        section.appendChild(heading);

        // COPY VIVA NOTES BUTTON

        const copyNotes = document.createElement("button");

        copyNotes.className = "copy";
        copyNotes.type = "button";
        copyNotes.textContent = "Copy viva notes";
        copyNotes.style.margin = "4px 0 12px";

        copyNotes.addEventListener("click", () => {
            copyText(
                getVivaText(notes),
                copyNotes,
                "Copy viva notes"
            );
        });

        section.appendChild(copyNotes);

        // IMPORTANT CONCEPTS

        const conceptsTitle = document.createElement("h3");

        conceptsTitle.textContent = "Important concepts";

        section.appendChild(conceptsTitle);

        const conceptsList = document.createElement("dl");

        conceptsList.style.cssText =
            "display:grid;grid-template-columns:minmax(110px, .7fr) 2fr;gap:8px 12px;margin:0";

        notes.concepts.forEach(([term, explanation]) => {
            const dt = document.createElement("dt");

            dt.textContent = term;
            dt.style.cssText =
                "font-weight:700;color:#4337a8";

            const dd = document.createElement("dd");

            dd.textContent = explanation;
            dd.style.cssText =
                "margin:0;color:#454b60";

            conceptsList.append(dt, dd);
        });

        section.appendChild(conceptsList);

        // VIVA QUESTIONS AND ANSWERS

        const vivaTitle = document.createElement("h3");

        vivaTitle.textContent = "Viva questions with answers";
        vivaTitle.style.marginTop = "22px";

        section.appendChild(vivaTitle);

        notes.viva.forEach(([question, answer], index) => {
            const item = document.createElement("details");

            item.style.cssText =
                "border:1px solid #e6e8f0;border-radius:10px;padding:10px 12px;margin:8px 0;background:#fff";

            const summary = document.createElement("summary");

            summary.textContent =
                (index + 1) + ". " + question;

            summary.style.cssText =
                "font-weight:650;cursor:pointer";

            const answerText = document.createElement("p");

            answerText.textContent = answer;

            answerText.style.cssText =
                "margin:9px 0 0;color:#555d72";

            item.append(summary, answerText);

            section.appendChild(item);
        });

        content.appendChild(section);

        // COPY COMPLETE PRACTICAL

        const copyAll = document.getElementById("copyAll");

        copyAll.addEventListener("click", () => {
            const allText =
                p.title + "\n" +
                p.desc + "\n\n" +

                p.files.map(file =>
                    file.name + "\n" + file.code
                ).join("\n\n") +

                "\n\n" + getVivaText(notes);

            copyText(
                allText,
                copyAll,
                "Copy this practical's notes"
            );
        });
    }

    // INFORMATION NOTE

    const note = document.createElement("div");

    note.className = "note";

    note.textContent =
        "Note: The programs have been typed and cleaned up from your notebook photos so the text is selectable and copyable. Check them against your lab manual before submission; output and thread order may vary.";

    content.appendChild(note);
}

// ==========================================
// SEARCH EVENT
// ==========================================

search.addEventListener("input", event => {
    renderNav(event.target.value);
});

// ==========================================
// INITIAL WEBSITE LOAD
// ==========================================

renderNav();
showPractical("p1");
