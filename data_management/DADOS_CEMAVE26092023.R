
library("tidyverse")
library("lubridate")

band_report = read_csv('./data_management/bands_1708379032282.csv') 
cemave_report = read_csv('./data_management/relatorio_cemave.csv')%>%mutate(reported=!is.na(reported))

band_report%>%filter(bandNumber=='C75191')

full_report = left_join(cemave_report, band_report, by=c('band_number'='bandNumber'))

notOnTrogon = full_report%>%filter(is.na(captures))

## De quando sao essas anilhas?
notOnTrogon%>%group_by(distribution)%>%summarize(n=n())
## 1 anilha nao esta no Trogon, de 19/05/2022
## 600 anilhas nao estao no Trogon, de 21/12/2023

notReportedWithCaptures = full_report%>%filter(!reported &  captures>0)%>%select(band_number)%>%unlist()


onTrogonNotInCemave = band_report%>%left_join(cemave_report, by=c('bandNumber'='band_number'))%>%filter(is.na(size))


CBRO2011 <- read_csv("./data_management/CBRO2011.csv")%>%mutate(NOME.CIENTIFICO=Taxon, CBRO=T)%>%select(NOME.CIENTIFICO,CBRO)

## Formating data to report
aDATA <- read_csv("./data_management/captures_1716860217956.csv") %>% mutate(datanew = format(as.Date(data, format = "%Y-%m-%d"), format = "%d/%m/%Y"))

DATA=aDATA%>%filter(data>mdy('02/28/2024'))




###Alterando o nome da coluna no CBRO2011
colnames(CBRO2011)[colnames(CBRO2011) == "NOME.CIENTIFICO"] <- "sppName"


## Put data in CEMAVE shape
DCEMAVE<-DATA%>%mutate(IDADE.CEMAVE=ifelse(grepl("FC",age_wrp)|grepl("FP",age_wrp),"J",ifelse(grepl("UC",age_wrp)|grepl("UP",age_wrp)|is.na(age_wrp),"D","A")), location=substr(station,1,3)) %>% 
  select(station, location,captureCode,bandSize, bandNumber, sppName, age_wrp, sex, IDADE.CEMAVE,datanew) %>% left_join(CBRO2011)



## Splitting data into different banding types
DCEMAVE_RECAP <- DCEMAVE%>%filter(captureCode=="R")%>%mutate("Código da Anilha" = bandSize, "Número da Anilha" = bandNumber, "Espécies" = sppName, "Código da Idade" = IDADE.CEMAVE, "Código do Sexo"=sex, "Data"=datanew, "Diâmetro do Tarso" = "", Observações = "")

DCEMAVE_DEST <- DCEMAVE%>%filter(captureCode=="D" | sppName=="Anilhus destruidus")%>%mutate(captureCode="D", IDADE.CEMAVE=NA)%>%mutate("Código da Anilha" = bandSize, "Número da Anilha" = bandNumber, "Espécies" = sppName, "Código da Idade" = IDADE.CEMAVE, "Código do Sexo"=sex, "Data"=datanew, "Diâmetro do Tarso" = "", Observações = "")

DCEMAVE_PERD <- DCEMAVE%>%filter(captureCode=="P" | sppName=="Anilhus perdidus")%>%mutate(captureCode="P", IDADE.CEMAVE=NA)%>%mutate("Código da Anilha" = bandSize, "Número da Anilha" = bandNumber, "Espécies" = sppName, "Código da Idade" = IDADE.CEMAVE, "Código do Sexo"=sex, "Data"=datanew, "Diâmetro do Tarso" = "", Observações = "")

DCEMAVE_NOVO <- DCEMAVE%>%filter(captureCode=="N" & sppName!="Anilhus destruidus" & sppName!="Anilhus perdidus")%>%mutate("Código da Anilha" = bandSize, "Número da Anilha" = bandNumber, "Espécies" = sppName, "Código da Idade" = IDADE.CEMAVE, "Código do Sexo"=sex, "Data"=datanew, "Diâmetro do Tarso" = "", Observações = "")



### Check if there is any species that is not in CBRO2011
DCEMAVE_NOVO %>%select(sppName,CBRO) %>% filter(is.na(CBRO))%>% unique()

## Correcting names
DCEMAVE_NOVO[which(DCEMAVE_NOVO$sppName=="Heliodoxa rubricauda"), "sppName"] <- "Clytolaema rubricauda" 
DCEMAVE_NOVO[which(DCEMAVE_NOVO$sppName=="Vireo chivi"), "sppName"] <- "Vireo olivaceus" 
DCEMAVE_NOVO[which(DCEMAVE_NOVO$sppName=="Microspingus lateralis"), "sppName"] <- "Poospiza lateralis" 
DCEMAVE_NOVO[which(DCEMAVE_NOVO$sppName=="Rhopias gularis"), "sppName"] <- "Myrmotherula gularis" 
DCEMAVE_NOVO[which(DCEMAVE_NOVO$sppName=="Myiothlypis leucoblephara"), "sppName"] <- "Basileuterus leucoblepharus" 
DCEMAVE_NOVO[which(DCEMAVE_NOVO$sppName=="Trichothraupis melanops"), "sppName"] <- "Lanio melanops" 


DCEMAVE_NOVO%>%mtate(location=ifelse(location=='BBF', 'BOA', location))
## Create folder
dirName = paste0("./RELATORIO_MAR2024-JUN2024")
dir.create(dirName)
dir.create(paste0(dirName,"/N"))

## Saving tables
DCEMAVE_NOVO %>%
  group_split(.$location) %>% map(~ select(.x,c("Código da Anilha", "Número da Anilha", "Espécies", "Código da Idade", "Código do Sexo", "Data", "Diâmetro do Tarso",  "Observações", location, bandSize)))%>%
  map(~ write_csv(.x, paste0(dirName,"/N/",.x$location[1],"_","_missing.csv")))

write_csv(DCEMAVE_DEST, paste0(dirName,"/DEST_missing.csv"))
write_csv(DCEMAVE_PERD, paste0(dirName,"/PERD_missing.csv"))
write_csv(DCEMAVE_RECAP, paste0(dirName,"/RECAP_missing.csv"))

DCEMAVE_NOVO
