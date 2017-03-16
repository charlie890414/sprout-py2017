a=int(input())
move=0
while a!=1:
    if a%2==0:
        a=a/2
        move=move+1
    else:
        a=3*a+1
        move=move+1
print(move)
