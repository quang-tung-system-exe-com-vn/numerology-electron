'use client'
import { format } from 'date-fns'
import { CalendarIcon, Calendar as CalendarIconLucide, Sparkles, User } from 'lucide-react'
import { useState } from 'react'
import { NumerologyInterpretationDialog } from 'renderer/components/dialogs/NumerologyInterpretationDialog'
import { PYTHAGORAS_TABLE } from 'renderer/components/shared/constants'
import { Button } from 'renderer/components/ui/button'
import { Calendar } from 'renderer/components/ui/calendar'
import { Card, CardContent } from 'renderer/components/ui/card'
import { Input } from 'renderer/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from 'renderer/components/ui/popover'
import { cn } from 'renderer/lib/utils'
import { TitleBar } from 'renderer/pages/main/TitleBar'
import { useButtonVariant } from 'renderer/stores/useAppearanceStore'

interface NumerologyData {
  lastName: number[]
  middleName: number[]
  firstName: number[]
  birthDate: number[]
  letterData?: {
    lastNameLetters: { letter: string; number: number }[]
    middleNameLetters: { letter: string; number: number }[]
    firstNameLetters: { letter: string; number: number }[]
  }
}

interface NumberInstance {
  value: number
  source: 'lastName' | 'middleName' | 'firstName' | 'birthDate'
}

interface GridCell {
  number: number
  instances: NumberInstance[]
}

export function MainPage() {
  const variant = useButtonVariant()

  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined)
  const [numerologyData, setNumerologyData] = useState<NumerologyData | null>(null)
  const [grid, setGrid] = useState<GridCell[]>([])

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogData, setDialogData] = useState<any>(null)
  const [dialogType, setDialogType] = useState<'cell' | 'general'>('cell')

  const convertToNumber = (text: string): number[] => {
    return text
      .toUpperCase()
      .split('')
      .filter(char => PYTHAGORAS_TABLE[char])
      .map(char => PYTHAGORAS_TABLE[char])
  }

  const getLetterNumberPairs = (text: string): { letter: string; number: number }[] => {
    return text
      .toUpperCase()
      .split('')
      .filter(char => PYTHAGORAS_TABLE[char])
      .map(char => ({ letter: char, number: PYTHAGORAS_TABLE[char] }))
  }

  const convertBirthDateToNumbers = (date: Date): number[] => {
    const dateStr = format(date, 'ddMMyyyy')
    return dateStr
      .split('')
      .map(Number)
      .filter(n => n > 0)
  }

  const calculateNumerology = () => {
    if (!fullName.trim() || !birthDate) return

    const nameParts = fullName
      .trim()
      .split(' ')
      .filter(part => part.length > 0)
    if (nameParts.length < 2) return

    const lastName = convertToNumber(nameParts[0])
    const middleName = nameParts.length > 2 ? convertToNumber(nameParts.slice(1, -1).join(' ')) : []
    const firstName = convertToNumber(nameParts[nameParts.length - 1])
    const birthNumbers = convertBirthDateToNumbers(birthDate)

    const data: NumerologyData = {
      lastName,
      middleName,
      firstName,
      birthDate: birthNumbers,
    }

    const letterData = {
      lastNameLetters: getLetterNumberPairs(nameParts[0]),
      middleNameLetters: nameParts.length > 2 ? getLetterNumberPairs(nameParts.slice(1, -1).join(' ')) : [],
      firstNameLetters: getLetterNumberPairs(nameParts[nameParts.length - 1]),
    }

    setNumerologyData({ ...data, letterData })

    const newGrid: GridCell[] = []
    for (let i = 1; i <= 9; i++) {
      const cell: GridCell = {
        number: i,
        instances: [],
      }

      lastName.forEach(n => {
        if (n === i) {
          cell.instances.push({ value: n, source: 'lastName' })
        }
      })

      middleName.forEach(n => {
        if (n === i) {
          cell.instances.push({ value: n, source: 'middleName' })
        }
      })

      firstName.forEach(n => {
        if (n === i) {
          cell.instances.push({ value: n, source: 'firstName' })
        }
      })

      birthNumbers.forEach(n => {
        if (n === i) {
          cell.instances.push({ value: n, source: 'birthDate' })
        }
      })

      newGrid.push(cell)
    }

    setGrid(newGrid)
  }
  const getNumberColor = (source: string): string => {
    switch (source) {
      case 'lastName':
      case 'middleName':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-800'
      case 'firstName':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-800'
      case 'birthDate':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-800'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
    }
  }

  const getCellBackgroundColor = (cell: GridCell): string => {
    if (cell.instances.length === 0) return 'bg-[var(--background)]'
    return 'bg-[var(--background)]'
  }

  const resetForm = () => {
    setFullName('')
    setBirthDate(undefined)
    setNumerologyData(null)
    setGrid([])
  }

  const handleCellClick = (cell: GridCell) => {
    if (cell.instances.length === 0) return

    setDialogTitle(`Luận giải con số ${cell.number}`)
    setDialogData(cell)
    setDialogType('cell')
    setDialogOpen(true)
  }

  const handleGeneralInterpretation = () => {
    if (!numerologyData || !birthDate) return

    const data = {
      fullName,
      birthDate: format(birthDate, 'dd/MM/yyyy'),
      grid,
    }

    setDialogTitle('Luận giải tổng quan thần số học')
    setDialogData(data)
    setDialogType('general')
    setDialogOpen(true)
  }

  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col flex-1 w-full">
        <TitleBar />
        <div className="p-4 space-y-4 flex flex-col h-full">
          <div className="space-y-4">
            <Card className="py-4">
              <CardContent className="px-4">
                <div className="flex flex-row gap-4 items-end">
                  <div className="grow">
                    <label htmlFor="fullName" className="text-sm font-medium">
                      Họ và tên đầy đủ
                    </label>
                    <Input id="fullName" placeholder="VD: Nguyễn Quang Tùng" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div className="flex-none w-[140px]">
                    <label htmlFor="birthDate" className="text-sm font-medium">
                      Ngày sinh
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !birthDate && 'text-muted-foreground')}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {birthDate ? format(birthDate, 'dd/MM/yyyy') : 'Chọn ngày sinh'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={birthDate} onSelect={setBirthDate} captionLayout="dropdown" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex gap-2 flex-none">
                    <Button onClick={calculateNumerology} variant={variant}>
                      Tính toán
                    </Button>
                    <Button onClick={resetForm} variant="outline">
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {numerologyData && (
            <div className="space-y-4">
              <Card className="py-4">
                <CardContent className="px-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Họ */}
                    <div className="space-y-2 p-2 border rounded-lg border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-600 dark:from-blue-900 dark:to-blue-950">
                      <div className="flex items-center justify-center gap-2">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-blue-700 dark:text-blue-300">Họ</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {numerologyData?.letterData?.lastNameLetters.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center bg-white dark:bg-blue-950 rounded-lg border border-blue-300 dark:border-blue-700 p-1 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="text-md font-bold text-blue-800 dark:text-blue-200">{item.letter}</div>
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">{item.number}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tên đệm */}
                    <div className="space-y-2 p-2 border rounded-lg border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-600 dark:from-blue-900 dark:to-blue-950">
                      <div className="flex items-center justify-center gap-2">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-blue-700 dark:text-blue-300">Tên đệm</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {numerologyData?.letterData?.middleNameLetters && numerologyData.letterData.middleNameLetters.length > 0 ? (
                          numerologyData.letterData.middleNameLetters.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col items-center bg-white dark:bg-blue-950 rounded-lg border border-blue-300 dark:border-blue-700 p-1 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="text-md font-bold text-blue-800 dark:text-blue-200">{item.letter}</div>
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">{item.number}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-blue-500 dark:text-blue-300 italic">Không có tên đệm</div>
                        )}
                      </div>
                    </div>

                    {/* Tên */}
                    <div className="space-y-2 p-2 border rounded-lg border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-600 dark:from-green-900 dark:to-green-950">
                      <div className="flex items-center justify-center gap-2">
                        <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="font-bold text-green-700 dark:text-green-300">Tên</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {numerologyData?.letterData?.firstNameLetters?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center bg-white dark:bg-green-950 rounded-lg border border-green-300 dark:border-green-700 p-1 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="text-md font-bold text-green-800 dark:text-green-200">{item.letter}</div>
                            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">{item.number}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ngày sinh */}
                    <div className="space-y-2 p-2 border rounded-lg border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:border-red-600 dark:from-red-900 dark:to-red-950">
                      <div className="flex items-center justify-center gap-2">
                        <CalendarIconLucide className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <span className="font-bold text-red-700 dark:text-red-300">Ngày sinh</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {numerologyData?.birthDate.map((num, idx) => (
                          <div
                            key={idx}
                            className="flex h-[63px] items-center bg-white dark:bg-red-950 rounded-lg border border-red-300 dark:border-red-700 p-1 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">{num}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div className="space-y-4 inline-grid h-full">
            <Card className="h-full py-4">
              <CardContent className="px-4 h-full">
                {!numerologyData ? (
                  <div className="flex items-center justify-center h-full text-gray-500">Nhập thông tin và nhấn "Tính toán" để xem biểu đồ thần số học</div>
                ) : (
                  <div className="space-y-4 h-[calc(100%-3rem)] m-auto">
                    <div className="flex flex-row flex-wrap justify-between w-full h-full gap-2">
                      {grid.map((cell, index) => (
                        <button
                          id={`cell-${index}`}
                          key={cell.number}
                          type="button"
                          disabled={cell.instances.length === 0}
                          className={cn(
                            'w-[32.5%] border-1 rounded-lg flex flex-col items-center justify-center text-center p-2 transition-all duration-500 hover:shadow-md hover:scale-105',
                            getCellBackgroundColor(cell),
                            cell.instances.length > 0 ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'cursor-default opacity-70'
                          )}
                          onClick={() => handleCellClick(cell)}
                        >
                          {cell.instances.length > 0 ? (
                            <div className="flex flex-wrap gap-1 justify-center">
                              {cell.instances.map((instance, idx) => (
                                <span key={idx} className={cn('text-md font-bold px-2 py-0.5 rounded', getNumberColor(instance.source))}>
                                  {instance.value}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-md font-bold text-gray-400">Trống</div>
                          )}
                        </button>
                      ))}
                    </div>
                    {/* Button Luân giải chung */}
                    {numerologyData && (
                      <div className="flex justify-center">
                        <Button onClick={handleGeneralInterpretation} variant={variant} size="lg" className="gap-2">
                          <Sparkles className="h-5 w-5" />
                          Luân giải chung
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog luận giải */}
      <NumerologyInterpretationDialog open={dialogOpen} onOpenChange={setDialogOpen} title={dialogTitle} data={dialogData} type={dialogType} />
    </div>
  )
}
