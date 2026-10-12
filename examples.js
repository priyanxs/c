// Classic Turbo C++ Examples and Templates
window.TURBO_EXAMPLES = [
    {
        id: "hello_world",
        title: "Hello World (Classic Turbo C++)",
        category: "Basics",
        description: "The classic first program taught in Indian schools & colleges using <iostream.h> and <conio.h>.",
        code: `// Turbo C++ 3.0 - Hello World
#include <iostream.h>
#include <conio.h>

void main()
{
    clrscr();  // Clear the output screen
    
    cout << "========================================" << endl;
    cout << "   WELCOME TO TURBO C++ 3.0 ONLINE!     " << endl;
    cout << "========================================" << endl;
    cout << endl;
    cout << "Hello, World!" << endl;
    cout << "C++ programming on Borland Turbo C++." << endl;
    cout << endl;
    cout << "Press any key to exit...";
    
    getch();   // Wait for keypress to keep user screen visible
}
`
    },
    {
        id: "conio_demo",
        title: "Conio.h Colors & Gotoxy Demo",
        category: "Conio.h",
        description: "Demonstrates clrscr(), gotoxy(x,y), textcolor(), and textbackground() in text video mode.",
        code: `// Conio.h Screen Control Demo
#include <iostream.h>
#include <conio.h>
#include <dos.h>

void main()
{
    int i;
    clrscr();
    
    // Draw decorative title box
    textbackground(BLUE);
    textcolor(YELLOW);
    gotoxy(20, 3);
    cprintf("=== BORLAND TURBO C++ CONIO DEMO ===");
    
    // Demonstrate 16 EGA colors
    for(i = 1; i <= 15; i++)
    {
        textcolor(i);
        gotoxy(15, 5 + i);
        cprintf("Color Code %2d: Turbo C++ Retro Text Output", i);
    }
    
    // Reset colors
    textcolor(WHITE);
    textbackground(BLACK);
    gotoxy(15, 23);
    cprintf("Press any key to finish...");
    
    getch();
}
`
    },
    {
        id: "graphics_intro",
        title: "BGI Graphics: Geometric Art",
        category: "Graphics.h",
        description: "Classic Borland Graphics Interface (BGI) using initgraph, circle, line, and rectangle.",
        code: `// Turbo C++ BGI Graphics Demo
#include <graphics.h>
#include <conio.h>
#include <dos.h>

void main()
{
    int gd = DETECT, gm;
    int midx, midy, r;
    
    // Initialize graphics mode
    initgraph(&gd, &gm, "C:\\\\TC\\\\BGI");
    
    midx = getmaxx() / 2;
    midy = getmaxy() / 2;
    
    // Title
    setcolor(YELLOW);
    outtextxy(midx - 120, 30, "TURBO C++ BGI GRAPHICS DEMO");
    
    // Draw concentric circles in different colors
    for(r = 20; r <= 140; r += 20)
    {
        setcolor((r / 20) % 15 + 1);
        circle(midx, midy, r);
        delay(100);
    }
    
    // Draw bounding rectangle
    setcolor(CYAN);
    rectangle(midx - 180, midy - 160, midx + 180, midy + 160);
    
    // Draw corner accent lines
    setcolor(LIGHTGREEN);
    line(midx - 180, midy - 160, midx - 140, midy - 140);
    line(midx + 180, midy - 160, midx + 140, midy - 140);
    line(midx - 180, midy + 160, midx - 140, midy + 140);
    line(midx + 180, midy + 160, midx + 140, midy + 140);
    
    setcolor(WHITE);
    outtextxy(midx - 110, midy + 180, "Press any key to close graphics...");
    
    getch();
    closegraph();
}
`
    },
    {
        id: "graphics_olympic",
        title: "BGI Graphics: Olympic Rings",
        category: "Graphics.h",
        description: "Classic computer lab practical exam question: Drawing the Olympic 5 rings using graphics.h.",
        code: `// Olympic Rings in Turbo C++ Graphics
#include <graphics.h>
#include <conio.h>

void main()
{
    int gd = DETECT, gm;
    int r = 45;
    int y1 = 180, y2 = 230;
    int x = 180;
    
    initgraph(&gd, &gm, "C:\\\\TC\\\\BGI");
    
    setcolor(WHITE);
    outtextxy(200, 50, "THE OLYMPIC SYMBOL");
    outtextxy(180, 80, "Turbo C++ BGI Graphics Exam Problem");
    
    // Blue ring (Top 1)
    setcolor(BLUE);
    circle(x, y1, r);
    circle(x, y1, r - 1);
    circle(x, y1, r - 2);
    
    // Black / White ring (Top 2)
    setcolor(WHITE);
    circle(x + 110, y1, r);
    circle(x + 110, y1, r - 1);
    circle(x + 110, y1, r - 2);
    
    // Red ring (Top 3)
    setcolor(RED);
    circle(x + 220, y1, r);
    circle(x + 220, y1, r - 1);
    circle(x + 220, y1, r - 2);
    
    // Yellow ring (Bottom 1)
    setcolor(YELLOW);
    circle(x + 55, y2, r);
    circle(x + 55, y2, r - 1);
    circle(x + 55, y2, r - 2);
    
    // Green ring (Bottom 2)
    setcolor(GREEN);
    circle(x + 165, y2, r);
    circle(x + 165, y2, r - 1);
    circle(x + 165, y2, r - 2);
    
    setcolor(LIGHTGRAY);
    outtextxy(200, 360, "Press any key to return...");
    
    getch();
    closegraph();
}
`
    },
    {
        id: "oop_student",
        title: "C++ Class & Object (OOP)",
        category: "C++ OOP",
        description: "Demonstrates object oriented programming in Turbo C++ with private members and member functions.",
        code: `// C++ Class & Object - Student Marksheet
#include <iostream.h>
#include <conio.h>

class Student
{
private:
    int rollNo;
    char name[30];
    float marks[3];
    float total;
    float percentage;

public:
    void getDetails()
    {
        cout << "Enter Roll Number: ";
        cin >> rollNo;
        cout << "Enter Name: ";
        cin >> name;
        cout << "Enter Marks in 3 Subjects (out of 100):" << endl;
        total = 0;
        for(int i = 0; i < 3; i++)
        {
            cout << "  Subject " << (i + 1) << ": ";
            cin >> marks[i];
            total += marks[i];
        }
        percentage = total / 3.0;
    }

    void displayMarksheet()
    {
        cout << endl;
        cout << "------------------------------------" << endl;
        cout << "          STUDENT REPORT            " << endl;
        cout << "------------------------------------" << endl;
        cout << "Roll No    : " << rollNo << endl;
        cout << "Name       : " << name << endl;
        cout << "Total Marks: " << total << " / 300" << endl;
        cout << "Percentage : " << percentage << "%" << endl;
        
        if(percentage >= 75.0)
            cout << "Grade      : Distinction" << endl;
        else if(percentage >= 60.0)
            cout << "Grade      : First Class" << endl;
        else if(percentage >= 50.0)
            cout << "Grade      : Second Class" << endl;
        else
            cout << "Grade      : Needs Improvement" << endl;
        cout << "------------------------------------" << endl;
    }
};

void main()
{
    clrscr();
    Student s;
    s.getDetails();
    s.displayMarksheet();
    
    cout << endl << "Press any key to exit...";
    getch();
}
`
    },
    {
        id: "matrix_multiplication",
        title: "Matrix Multiplication 2D Array",
        category: "Arrays",
        description: "Standard practical exam program for multiplying two 2x2 or 3x3 matrices.",
        code: `// Matrix Multiplication in Turbo C++
#include <iostream.h>
#include <conio.h>

void main()
{
    clrscr();
    int a[2][2], b[2][2], c[2][2];
    int i, j, k;

    cout << "=== 2x2 Matrix Multiplication ===" << endl;
    
    // Input Matrix A
    cout << "Enter elements of Matrix A (2x2):" << endl;
    for(i = 0; i < 2; i++)
        for(j = 0; j < 2; j++)
            cin >> a[i][j];

    // Input Matrix B
    cout << "Enter elements of Matrix B (2x2):" << endl;
    for(i = 0; i < 2; i++)
        for(j = 0; j < 2; j++)
            cin >> b[i][j];

    // Multiply
    for(i = 0; i < 2; i++)
    {
        for(j = 0; j < 2; j++)
        {
            c[i][j] = 0;
            for(k = 0; k < 2; k++)
            {
                c[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    // Display Result
    cout << endl << "Resultant Matrix C (A x B):" << endl;
    for(i = 0; i < 2; i++)
    {
        cout << "[ ";
        for(j = 0; j < 2; j++)
        {
            cout << c[i][j] << " ";
        }
        cout << "]" << endl;
    }

    getch();
}
`
    },
    {
        id: "palindrome_check",
        title: "Palindrome Number & String",
        category: "Algorithms",
        description: "Check if an integer or string is a palindrome using while loop.",
        code: `// Palindrome Checker in Turbo C++
#include <iostream.h>
#include <conio.h>

void main()
{
    clrscr();
    long n, num, reversed = 0, remainder;

    cout << "Enter an integer to check palindrome: ";
    cin >> n;

    num = n;

    while(num != 0)
    {
        remainder = num % 10;
        reversed = reversed * 10 + remainder;
        num /= 10;
    }

    cout << endl;
    if(n == reversed)
    {
        cout << "RESULT: " << n << " is a PALINDROME!" << endl;
    }
    else
    {
        cout << "RESULT: " << n << " is NOT a palindrome." << endl;
        cout << "Reversed number is: " << reversed << endl;
    }

    cout << endl << "Press any key to finish...";
    getch();
}
`
    },
    {
        id: "tower_of_hanoi",
        title: "Tower of Hanoi (Recursion)",
        category: "Recursion",
        description: "Classic recursive problem solving demonstration in C++.",
        code: `// Tower of Hanoi - Recursive Algorithm
#include <iostream.h>
#include <conio.h>

void hanoi(int n, char from_rod, char to_rod, char aux_rod)
{
    if (n == 1)
    {
        cout << "Move disk 1 from rod " << from_rod << " to rod " << to_rod << endl;
        return;
    }
    hanoi(n - 1, from_rod, aux_rod, to_rod);
    cout << "Move disk " << n << " from rod " << from_rod << " to rod " << to_rod << endl;
    hanoi(n - 1, aux_rod, to_rod, from_rod);
}

void main()
{
    clrscr();
    int disks = 3;
    
    cout << "========================================" << endl;
    cout << "       TOWER OF HANOI SIMULATOR         " << endl;
    cout << "========================================" << endl;
    cout << "Number of disks: " << disks << endl;
    cout << "Steps to solve:" << endl << endl;

    hanoi(disks, 'A', 'C', 'B');

    cout << endl << "Completed successfully in 2^n - 1 moves!" << endl;
    getch();
}
`
    },
    {
        id: "c_stdio_demo",
        title: "Standard C in Turbo C (printf/scanf)",
        category: "Standard C",
        description: "Demonstrating C language mode in Turbo C++ using <stdio.h> and <conio.h>.",
        code: `/* Classic C Program in Turbo C */
#include <stdio.h>
#include <conio.h>

int main()
{
    int a, b, sum;
    clrscr();

    printf("======================================\\n");
    printf("   TURBO C LANGUAGE COMPILER DEMO     \\n");
    printf("======================================\\n\\n");

    printf("Enter first integer : ");
    scanf("%d", &a);
    printf("Enter second integer: ");
    scanf("%d", &b);

    sum = a + b;
    printf("\\nThe sum of %d and %d is: %d\\n", a, b, sum);
    printf("Size of int in Turbo C is: %d bytes (16-bit)\\n", sizeof(int));

    printf("\\nPress any key to exit...");
    getch();
    return 0;
}
`
    }
];
