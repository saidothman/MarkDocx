Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\development\playground\mdtodoc"
WshShell.Run "cmd.exe /c npm start", 0, False
