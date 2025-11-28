from django.http import HttpResponse

def home(request):
    return HttpResponse("Backend API is running!")
